import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useAuth} from "react-oidc-context";
import {Navigate} from "react-router-dom";

const AuthPage = () => {
    const auth = useAuth();
    if (auth.isAuthenticated) {
        return (
            <Navigate to="/dashboard" replace/>
        );
    }
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Sign In</CardTitle>
                            <CardDescription>
                                Sign in to Access your Dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-6">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    onClick={() => auth.signinRedirect()}>
                                    Sign In
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
