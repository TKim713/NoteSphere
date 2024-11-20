import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

import { useAuth } from 'hooks/useAuth';

import PopupModal from '../Layout/Main/PopupModal';
import styles from './index.module.scss';

const AuthForm = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isLogin = pathname === '/login';

  const { signup, login, error } = useAuth();

  const [userInput, setUserInput] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [modalVisible, setModalVisible] = useState(false);

  const { name, lastName, email, password, confirmPassword } = userInput;

  const handleInput = (e) => {
    setUserInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearInput = (e) => {
    const inputName = e.target.closest('div').querySelector('input').name;
    setUserInput((prevState) => ({
      ...prevState,
      [inputName]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login({
        email,
        password,
      });
    } else {
      await signup(userInput);
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigate('/login');
  };

  return (
    <div onSubmit={handleSubmit} className={styles.container}>
      <header className={styles.header}>
        {/* <div className={styles.nav}>Note</div> */}
        <div className={styles.nav}>
          <img
            src="/logo.png"
            alt="logo"
            style={{ width: "50px", height: "50px" }}
          />
          <div className={styles.divider}></div>
          <span>NoteSphere</span>
        </div>
      </header>
      <main className={styles.main}>
        <form className={styles.form}>
          <div className={styles.title_wrapper}>
            <h1 className={styles.title}>{isLogin ? 'Log in' : 'Sign up'}</h1>
          </div>
          <div className={styles.inputs_container}>
            {!isLogin && (
              <>
                <label>
                  <span>Name</span>
                  <div className={styles.input_wrapper}>
                    <input
                      name="name"
                      onChange={handleInput}
                      value={name}
                      type="text"
                      placeholder="Enter your name..."
                      // required
                    />
                    {name.length > 0 && (
                      <FaTimesCircle
                        onClick={handleClearInput}
                        className={styles.cancel_icon}
                        size={'1.6rem'}
                      />
                    )}
                  </div>
                </label>
                <label>
                  <span>Last Name</span>
                  <div className={styles.input_wrapper}>
                    <input
                      name="lastName"
                      onChange={handleInput}
                      value={lastName}
                      type="text"
                      placeholder="Enter your last name..."
                      // required
                    />
                    {lastName.length > 0 && (
                      <FaTimesCircle
                        onClick={handleClearInput}
                        className={styles.cancel_icon}
                        size={'1.6rem'}
                      />
                    )}
                  </div>
                </label>
              </>
            )}
            <label>
              <span>Email</span>
              <div className={styles.input_wrapper}>
                <input
                  name="email"
                  onChange={handleInput}
                  value={email}
                  type="email"
                  placeholder="Enter your email address..."
                  // required
                />
                {email.length > 0 && (
                  <FaTimesCircle
                    onClick={handleClearInput}
                    className={styles.cancel_icon}
                    size={'1.6rem'}
                  />
                )}
              </div>
            </label>
            <label>
              <span>Password</span>
              <div className={styles.input_wrapper}>
                <input
                  name="password"
                  onChange={handleInput}
                  value={password}
                  type="password"
                  placeholder="Enter your password..."
                  // required
                />
                {password.length > 0 && (
                  <FaTimesCircle
                    onClick={handleClearInput}
                    className={styles.cancel_icon}
                    size={'1.6rem'}
                  />
                )}
              </div>
            </label>
            {!isLogin && (
              <label>
                <span>Confirm Password</span>
                <div className={styles.input_wrapper}>
                  <input
                    name="confirmPassword"
                    onChange={handleInput}
                    value={confirmPassword}
                    type="password"
                    placeholder="Confirm your password..."
                    // required
                  />
                  {password.length > 0 && (
                    <FaTimesCircle
                      onClick={handleClearInput}
                      className={styles.cancel_icon}
                      size={'1.6rem'}
                    />
                  )}
                </div>
              </label>
            )}
          </div>
          <button className={styles.submit} type="submit">
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.switch_mode_wrapper}>
            <Link
              to={isLogin ? '/signup' : '/login'}
              className={styles.switch_mode}
            >
              {isLogin ? 'New account?' : 'Already have an account?'}
            </Link>
          </div>
        </form>
      </main>

      <PopupModal isVisible={modalVisible} onClose={handleModalClose}>
        <p>Signup successful! Please check your email for verification.</p>
      </PopupModal>
    </div>
  );
};

export default AuthForm;
