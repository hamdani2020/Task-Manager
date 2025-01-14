import {useAuth} from "react-oidc-context";
import {Navigate} from "react-router-dom";
import Loading from "@/components/loading.tsx";

const AuthGuard = () => {
    const auth = useAuth();

    if (auth.isLoading) {
        return (
            <Loading/>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/auth" replace/>;
    }

    return (
        <Navigate to="/dashboard" replace/>
    );
};

export default AuthGuard;
