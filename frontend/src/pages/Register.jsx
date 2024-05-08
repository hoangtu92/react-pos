import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch} from 'react-redux'
import { register, reset } from '../features/auth/authSlice'
import trans from "../utils/translate";

const Register = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  })

  const { name, email, password } = form

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, success, error, message } = useSelector(state => state.auth)

  useEffect(() => {
    if (error) {
      alert(message)
    }
    if (success || user) {
      navigate('/login')
    }
    dispatch(reset())
  }, [error, success, user, message, navigate, dispatch])

  const onChange = (e) => {
    setForm({  ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const userData = {
      name, email, password
    }
    dispatch(register(userData))
    navigate('/login')
  }

  return (
      <>
      <div className='auth-container'>




              <form className='register-form' onSubmit={handleSubmit}>

                <h1>{trans("register")}</h1>
                <div className='formInput'>
                    <label>{trans("name")}</label>
                    <input type="text" placeholder={trans("name")} name='name' value={name} onChange={onChange} />
                  </div>

                <div className='formInput'>
                  <label>{trans("email")}</label>
                  <input type="email" placeholder={trans("email")} name='email' value={email} onChange={onChange} />
                </div>


                <div className='formInput'>
                  <label>{trans("password")}</label>
                  <input type="password" placeholder={trans("password")} name='password' value={password} onChange={onChange} />
                </div>

              <button type='submit' className='btn-grad'>{trans("register")}</button>

             <div className='home'><a href='/'>{trans("go_to_home")}</a></div>
          </form>
          </div>
      </>
  )
}

export default Register
