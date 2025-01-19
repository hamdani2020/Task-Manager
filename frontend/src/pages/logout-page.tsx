import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "react-oidc-context";

const LogoutPage = () => {

    const auth = useAuth();
    useEffect(() => {
        auth.removeUser().then();
        localStorage.clear();
        sessionStorage.clear();
    }, [auth]);

    return (
        <Navigate to="/auth" replace/>
    );
};

export default LogoutPage;
