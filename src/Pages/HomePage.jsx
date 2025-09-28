import { useNavigate } from "react-router-dom";


const HomePage = () => {
    const navigate = useNavigate();

    return(
        <>
        <p>This is home page</p>
        <button onClick={() => {navigate("/login")}}>Login</button>
        
        </>
    )
}

export default HomePage;