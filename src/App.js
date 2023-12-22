import './App.css';
import Artifact from './view/Artifact';
import gLogo from './resource/github-mark.png';

import { Layout } from 'antd';

const { Header, Footer } = Layout;

function App() {
  return (
    <Layout>
      <Header className="header">
        <a href="/">
          <div className="titleText"> 메이플 유니온 아티팩트 </div>
        </a>
      </Header>
      <Layout className="whiteback">
        <Artifact />
      </Layout>
      <Footer className="footer">
        <a href="https://github.com/nanosando" target="_blank">
          <img src={gLogo} width='30px'></img>
        </a>
      </Footer>
    </Layout>
  );
}

export default App;
