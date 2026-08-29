import { isRouteErrorResponse, NavLink, useNavigate, useRouteError } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const ErrorScreen = ({ isNotFound, message }) => {
    const navigate = useNavigate();
    const { translate } = useLanguage();

    return (
        <section className="page-shell max-w-3xl">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-center shadow-2xl">
                <div className="hero-pad bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 text-white">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                        {isNotFound
                            ? translate("Page not found", "پاڼه ونه موندل شوه", "صفحه یافت نشد")
                            : translate("Something went wrong", "ستونزه رامنځته شوه", "مشکلی پیش آمد")}
                    </p>
                    <p className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">{isNotFound ? "404" : "!"}</p>
                    <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
                        {isNotFound
                            ? translate("This route does not exist", "دا لار شتون نه لري", "این مسیر وجود ندارد")
                            : translate("The page could not be loaded", "پاڼه ونه لوستل شوه", "صفحه بارگذاری نشد")}
                    </h1>
                </div>
                <div className="space-y-6 px-5 py-8 sm:px-8 sm:py-10">
                    <p className="text-base text-slate-500">
                        {message ||
                            (isNotFound
                                ? translate(
                                      "The page you were looking for could not be found.",
                                      "هغه پاڼه چې تاسې یې لټوله ونه موندل شوه.",
                                      "صفحه‌ای که دنبال آن بودید یافت نشد."
                                  )
                                : translate(
                                      "Please go back and try again.",
                                      "مهرباني وکړئ بیرته لاړ شئ او بیا هڅه وکړئ.",
                                      "لطفاً برگردید و دوباره تلاش کنید."
                                  ))}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <NavLink
                            to="/"
                            className="rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg transition hover:bg-blue-700"
                        >
                            {translate("Go to home", "کور ته لاړ شئ", "رفتن به خانه")}
                        </NavLink>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                        >
                            {translate("Go back", "بیرته", "بازگشت")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const NotFound = () => <ErrorScreen isNotFound />;

export const ErrorPage = () => {
    const error = useRouteError();
    const isNotFound = isRouteErrorResponse(error) && error.status === 404;
    const message = isRouteErrorResponse(error)
        ? error.statusText || error.data?.message
        : error?.message;

    return <ErrorScreen isNotFound={isNotFound} message={typeof message === "string" ? message : ""} />;
};
