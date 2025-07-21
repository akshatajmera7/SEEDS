import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Navigate to the content page without authentication
        navigate('/content');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1>Welcome to SEEDS</h1>
            <br />
            <button
                className="btn"
                style={{ backgroundColor: "#28574F", color: "white" }}
                onClick={handleLogin}
            >
                Proceed to Content
            </button>
        </div>
    );
};

export default Login;