import {useAuth} from "../Context/AuthContext";

const Dashboard = () => {
    const {user, logout} = useAuth();
    // console.log(user, "user in dashboard");
    const handleLogout = () => {
        // console.log("in handle logout");
        logout();
    }
    return(
        <>Dashboard after login
        <p>{user.email}</p>
        <p>{user.uuid}</p>
        <button onClick={handleLogout}>Logout</button>
        </>
    )
}

export default Dashboard;