import { Outlet, useNavigation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Loading } from "./Loading";

const AppLayout = () => {
    const navigation = useNavigation();
    if (navigation.state === "loading") return <Loading />;
    return (
        <section className="app-layout">
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
        </section>
    );
};

export default AppLayout;
