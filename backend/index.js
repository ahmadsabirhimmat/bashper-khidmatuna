require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDb = require('./config/db');
const ensureAdminUser = require('./utils/ensureAdminUser');
const { ensureSiteContact } = require('./controllers/siteContactController');
const { ensurePolicy, ensureTerms } = require('./controllers/policyController');
const { ensureCriticalContacts } = require('./utils/criticalContactsStore');
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const siteRoutes = require('./routes/siteRoutes');
const policyRoutes = require('./routes/policyRoutes');
const criticalContactRoutes = require('./routes/criticalContactRoutes');
const { csrfProtection, getCsrfToken } = require('./middleware/csrf');
const { apiLimiter, csrfTokenLimiter, writeLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { serveProviderImage } = require('./controllers/mediaController');
const { getMailConfig, getMailTransport, isOtpDevMode } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('etag');
app.use((req, res, next) => {
	if (req.path.startsWith('/uploads/')) {
		return next();
	}
	res.set('Cache-Control', 'no-store');
	next();
});

const DEFAULT_ALLOWED_ORIGINS = [
	'http://localhost:5175',
	'http://localhost:4175',
	'http://localhost:5176',
	'http://localhost:4176',
];

const parseOrigins = (value) =>
	value
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);

const withLocalhostAliases = (origins) => {
	const expanded = new Set(origins);
	origins.forEach((origin) => {
		try {
			const url = new URL(origin);
			if (url.hostname === 'localhost') {
				expanded.add(`${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ''}`);
			}
			if (url.hostname === '127.0.0.1') {
				expanded.add(`${url.protocol}//localhost${url.port ? `:${url.port}` : ''}`);
			}
		} catch (error) {
			console.warn('Invalid CORS origin skipped:', origin, error.message);
		}
	});
	return Array.from(expanded);
};

const allowedOrigins = withLocalhostAliases(
	process.env.CLIENT_URL ? parseOrigins(process.env.CLIENT_URL) : DEFAULT_ALLOWED_ORIGINS
);

const isDev = process.env.NODE_ENV !== 'production';

if (!isDev) {
	app.set('trust proxy', 1);

	if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production') {
		console.error('JWT_SECRET must be a strong unique value in production.');
		process.exit(1);
	}

	if (String(process.env.OTP_DEV_MODE || '').toLowerCase() === 'true') {
		console.warn(
			'OTP_DEV_MODE is true in production. OTP emails will print to logs instead of sending. Set OTP_DEV_MODE=false before going live.'
		);
	}

	if (!process.env.CLIENT_URL) {
		console.warn(
			'CLIENT_URL is empty. Set it to your live admin and provider origins, comma-separated, or browsers will be blocked by CORS.'
		);
	}
}

const resolveCorsOrigin = (origin, callback) => {
	if (!origin) {
		return callback(null, true);
	}

	if (allowedOrigins.includes(origin)) {
		return callback(null, true);
	}

	if (isDev) {
		try {
			const { protocol, hostname, port } = new URL(origin);
			if (['localhost', '127.0.0.1'].includes(hostname)) {
				const normalized = `${protocol}//localhost${port ? `:${port}` : ''}`;
				if (!allowedOrigins.includes(normalized)) {
					allowedOrigins.push(normalized);
				}
				return callback(null, true);
			}
		} catch (error) {
			console.warn('Unable to parse origin for CORS check:', origin, error.message);
		}
	}

	const message = `Origin ${origin} not allowed by CORS`;
	console.warn(message);
	return callback(new Error(message));
};

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
		contentSecurityPolicy: false,
	})
);
app.use(
	cors({
		origin: isDev ? true : resolveCorsOrigin,
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Accept'],
	})
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use(csrfProtection);
app.use(writeLimiter);
app.get('/uploads/:filename', serveProviderImage);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
app.use(morgan(isDev ? 'dev' : 'combined'));

app.get('/health', (req, res) => {
	const transport = getMailTransport();
	res.json({
		status: 'ok',
		service: 'emergency-contacts',
		mailConfigured: transport !== 'none',
		mailTransport: transport,
		otpDevMode: isOtpDevMode(),
	});
});

app.get('/api/csrf-token', csrfTokenLimiter, getCsrfToken);

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/critical-contacts', criticalContactRoutes);

app.get('/', (req, res) => {
	res.json({
		name: 'Bashper Khidmatuna API',
		version: '1.1.0',
		endpoints: {
			csrf: '/api/csrf-token',
			auth: '/api/auth',
			directory: '/api/directory',
			providers: '/api/providers',
			site: '/api/site',
			policy: '/api/policy',
			criticalContacts: '/api/critical-contacts',
		},
	});
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
	try {
		await connectDb();
		await ensureAdminUser();
		await ensureSiteContact();
		await ensurePolicy();
		await ensureTerms();
		await ensureCriticalContacts();
		const host = process.env.HOST || (isDev ? undefined : '0.0.0.0');
		const onListen = () => {
			const { user } = getMailConfig();
			const transport = getMailTransport();
			console.log(`Emergency Contacts API listening on ${host || 'all interfaces'}:${PORT}`);
			const mailLabel = {
				dev: 'OTP_DEV_MODE (codes in logs only)',
				brevo: `Brevo HTTPS as ${user || 'MAIL_FROM'}`,
				resend: `Resend HTTPS as ${user || 'MAIL_FROM'}`,
				smtp: `Gmail SMTP as ${user}`,
				none: 'NOT CONFIGURED — on Render free set BREVO_API_KEY or RESEND_API_KEY',
			}[transport];
			console.log(`Mail: ${mailLabel}`);
			if (!isDev) {
				console.log('CORS allowlist:', allowedOrigins.join(', ') || '(empty)');
			}
		};
		if (host) {
			app.listen(PORT, host, onListen);
		} else {
			app.listen(PORT, onListen);
		}
	} catch (error) {
		console.error('Failed to start Emergency Contacts API:', error.message);
		process.exit(1);
	}
};

startServer();
