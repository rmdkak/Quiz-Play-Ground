import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { logout } from 'api/auth';
import { auth } from 'config/firebase';
import { activeButtonStore, loginStateStore, signUpStateStore, userStore } from 'store';

import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';

const Header: FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { loginUser, logoutUser } = userStore();
  const uid = sessionStorage.getItem('userId');
  const name = sessionStorage.getItem('userName');
  const email = sessionStorage.getItem('userEmail');

  useEffect(() => {
    loginUser({ uid, email, name });
  }, []);

  const activeButton = activeButtonStore(state => state.activeButton);
  const setActiveButton = activeButtonStore(state => state.setActiveButton);

  const fetchUser = async () => {
    if (uid === null) {
      try {
        await logout();
        sessionStorage.clear();
      } catch (error) {
        console.error('에러 발생');
      }
    }
  };

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if (user !== null) {
        setIsLogin(false);
      } else {
        setIsLogin(true);
      }
    });
    fetchUser().catch(Error);
  }, [uid]);

  // Auth modal Store
  const isLoginModalOpen = loginStateStore(state => state.isModalOpen);
  const toggleLoginModal = loginStateStore(state => state.toggleModal);
  const isSignUpModalOpen = signUpStateStore(state => state.isModalOpen);
  const toggleSignUpModal = signUpStateStore(state => state.toggleModal);

  return (
    <>
      {isLoginModalOpen && <LoginModal />}
      {isSignUpModalOpen && <SignUpModal />}
      <div className="flex items-center justify-between w-full h-[60px] p-2 px-8">
        <Link
          to={pathname === '/main' ? '/' : '/main'}
          onClick={() => {
            setActiveButton(null);
          }}
        >
          <img src={'/assets/logo-playground.svg'} alt="Quiz-PlayGround" />
        </Link>
        <div className="flex gap-4">
          {isLogin ? (
            <>
              <button
                className="text-black"
                onClick={() => {
                  toggleSignUpModal();
                }}
              >
                가입하기
              </button>
              <p className="text-black">|</p>
              <button
                className="text-black"
                onClick={() => {
                  toggleLoginModal();
                }}
              >
                로그인
              </button>
            </>
          ) : (
            <>
              <Link
                to={'/addgame'}
                className={`${activeButton === 'addGame' ? 'text-gray3' : 'text-black'}`}
                onClick={() => {
                  setActiveButton('addGame');
                }}
              >
                게임만들기
              </Link>
              <p className="text-black">|</p>
              <Link
                to={'/mypage'}
                className={`${activeButton === 'myPage' ? 'text-gray3' : 'text-black'}`}
                onClick={() => {
                  setActiveButton('myPage');
                }}
              >
                마이페이지
              </Link>
              <p className="text-black">|</p>
              <button
                className="text-black"
                onClick={() => {
                  logoutUser();
                  setActiveButton(null);
                  logout().catch(error => {
                    error.errorHandler(error);
                  });
                  sessionStorage.clear();
                  navigate('/');
                }}
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
