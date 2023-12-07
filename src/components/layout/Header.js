import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Grid, Toolbar, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';
import { isLogin, getLoginUserInfo } from '../../utils/login-util';
import AuthContext from '../../utils/AuthContext';
import { API_BASE_URL, USER } from '../../config/host-config';

const Header = () => {
  const profileRequestURL = `${API_BASE_URL}${USER}/load-profile`;

  const redirection = useNavigate();

  // 프로필 이미지 url 상태 변수
  const [profileUrl, setProfileUrl] = useState(null);

  // AuthContext에서 로그인 상태를 가져옵니다.
  const { isLoggedIn, userName, onLogout } = useContext(AuthContext);

  // 로그아웃 핸들러
  const logoutHandler = async () => {
    const res = await fetch(`${API_BASE_URL}${USER}/logout`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
      },
    });

    // AuthContext의 onLogout 함수를 호출하여 로그인 상태를 업데이트 합니다.
    onLogout();
    redirection('/login');
  };

  // 프로필 이미지 요청
  const fetchProfileImage = async () => {
    const res = await fetch(profileRequestURL, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
      },
    });

    if (
      res.status === 200 &&
      res.headers.get('Content-type').startsWith('image')
    ) {
      // content-type이 image면 직접가입한 사람 ,  카카오톡 유저는 이미지가 그냥 홈페이지 url 주소로와서 text 임
      // 서버에서는 byte[]로 직렬화된 이미지가 응답됨 ( 그렇게 설정했음 )
      // blob()을 통해 전달받아야 한다. (json() xxx)
      const profileBlob = await res.blob();
      // 해당 이미지를 imgUrl로 변경
      const imgUrl = window.URL.createObjectURL(profileBlob);
      setProfileUrl(imgUrl);
    } else if (
      res.status === 200 &&
      res.headers.get('Content-type').startsWith('text')
    ) {
      const imgUrl2 = await res.text();
      // 해당 이미지를 imgUrl로 변경

      setProfileUrl(imgUrl2);
    } else {
      const err = await res.text();
      setProfileUrl(null);
    }
  };

  // 로그인의 상태가 변화될 떄 화면이 리렌더링이 되고,
  // 그에 맞는 회원의 프로필 이미지 요청이 들어갈 수 있도록 처리.
  useEffect(() => {
    fetchProfileImage();
  }, [isLoggedIn]);

  return (
    <AppBar
      position='fixed'
      style={{
        background: '#38d9a9',
        width: '100%',
      }}
    >
      <Toolbar>
        <Grid
          justify='space-between'
          container
        >
          <Grid
            item
            flex={9}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography variant='h4'>
                {isLoggedIn ? userName + '님' : '오늘'}의 할일
              </Typography>

              {isLoggedIn && (
                <img
                  src={profileUrl || require('../../assets/img/anonymous.jpg')}
                  alt='프사프사'
                  style={{
                    marginLeft: 20,
                    width: 75,
                    height: 75,
                    borderRadius: '50%',
                  }}
                />
              )}
            </div>
          </Grid>

          <Grid item>
            <div className='btn-group'>
              {isLoggedIn ? (
                <button
                  className='logout-btn'
                  onClick={logoutHandler}
                >
                  로그아웃
                </button>
              ) : (
                <>
                  <Link to='/login'>로그인</Link>
                  <Link to='/join'>회원가입</Link>
                </>
              )}
            </div>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
