import {createBrowserRouter, RouterProvider} from "react-router-dom";
import LoginPage from '@/pages/login-page';
import AuthGuard from '@/guards/auth-guard';
import "@/index.css"
// Assuming you have a create task form component

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthGuard/>,
    },
    {
        path: "/auth", // Ensure you have a route for login
        element: <LoginPage/>,
    },
    // {
    //     path: "/dashboard",
    //     element: <MainPage/>,
    //     children: [
    //         {
    //             index: true,
    //             element: <DashboardPage/>,
    //         },
    //         {
    //             path: "tasks",
    //             element: <TaskLayout/>,
    //             children: [
    //                 {
    //                     index: true,
    //                     element: <TasksPage/>,
    //                 },
    //                 {
    //                     path: "create",
    //                     element: <CreateTaskPage/>,
    //                 },
    //                 {
    //                     path: "view/:taskId",
    //                     element: <ViewTaskPage/>,
    //                 }
    //             ],
    //         },
    //     ],
    // },
    // {
    //     path: "/logout", // Ensure you have a route for logout
    //     element: <LogoutPage/>,
    // },
    // {
    //     path: "*", // Catch-all route for unmatched URLs
    //     element: <Error404Page/>,
    // },
]);

const App = () => {
    return <RouterProvider router={router}/>;
};

export default App;
