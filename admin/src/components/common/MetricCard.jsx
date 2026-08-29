const MetricCard = ({
  title,
  value,
  subtitle,
  delta,
  tone = 'accent',
  footer,
}) => (
  <article className={`metric metric--${tone}`}>
    <p className="metric__title">{title}</p>
    <p className="metric__value">{value}</p>
    {subtitle ? <p className="metric__subtitle">{subtitle}</p> : null}
    {delta ? <p className="metric__delta">{delta}</p> : null}
    {footer ? <p className="metric__footer">{footer}</p> : null}
  </article>
);

export default MetricCard;
