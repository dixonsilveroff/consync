import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from '../components/auth/AuthForm';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "admin",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.company) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const registerData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        role: formData.role
      };
      
      await register(registerData);
      const dest = location.state?.from?.pathname || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setErrors({
        ...errors,
        submit: err.message || "Registration failed. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={false}
      formData={formData}
      errors={errors}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
