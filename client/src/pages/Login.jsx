import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

const Login = () => {
    const primarycolor = "rgb(168 48 189)"
  // const hovercolor = '#e64323'
  const bgcolor = 'rgb(196 158 236)'
  const borderColor = '#dddddd'


  const {showPassword,setShowPassword} = useState(false);
  const {email,setEmail} = useState("")
  const {password,setPassword} = useState("")
  const navigate = useNavigate();

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ backgroundColor: bgcolor }}>
        <div className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8`} style={{ border: `1px solid ${borderColor}` }} >
            <h1 className={`text-3xl font-bold mb-2`} style={{ color: primarycolor, textAlign:'center' }}>AI Slides</h1>
            <p className='text-gray-600 mb-4 text-sm'>Log in to your account to start creating stunning presentations with AI Slides.</p>

            {/* Email */}
            <div className='mb-4'>
            <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
            <input type='email' className='w-full border rounded-lg px-3 py-2 focus:border-purple-500' placeholder='Enter Your Email' style={{ border: `1px solid ${borderColor}` }} required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            {/* password */}
            <div className='mb-4'>
            <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
            <div className='relative'>
                <input type={`${showPassword ? "text" : "password"}`} className='w-full border rounded-lg px-3 py-2 focus:border-purple-500 ' placeholder='Enter Your Password' style={{ border: `1px solid ${borderColor}` }} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className='absolute right-3 cursor-pointer text-gray-500' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
            </div>
            </div>
            <div className='text-right mb-4 text-[#642191] hover:text-[#b900ff] cursor-pointer' onClick={() => navigate("/forgot-password")}>Forgot Password</div>
            <p className='text-center mt-6 cursor-pointer'>Want to create account?<span className='text-[#642191]' onClick={() => navigate('/signup')}>Sign Up</span></p>

            </div>
    </div>
  )
}

export default Login