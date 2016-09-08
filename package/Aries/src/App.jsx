import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { Nav, NavItem } from 'bfd/Nav'
import xhr from 'bfd/xhr'
import auth from 'public/auth'
import conf from 'public/Conf/Conf'
import env from './env'
import './App.less'
import 'antd/dist/antd.less'
import { Select ,Option} from 'bfd-ui/lib/Select2'

const LOGIN_PATH = (env.basePath + '/login').replace(/\/\//, '/')

const App = React.createClass({

  contextTypes: {
    history: PropTypes.object
  },

  getInitialState() {
    return {
      // 用户是否登录
      loggedIn: auth.isLoggedIn(),
      cur_space:auth.user.cur_space
    }
  },

  componentWillMount() {
    // 页面加载后判断是否需要跳转到登录页
    if (!this.state.loggedIn && !this.isInLogin()) {
      this.login()
    }
  },

  componentWillReceiveProps() {
    this.setState({
      loggedIn: auth.isLoggedIn()
    })
  },

  // 当前 URL 是否处于登录页
  isInLogin() {
    return this.props.location.pathname === LOGIN_PATH
  },

  // 权限判断
  hasPermission() {
    // ...根据业务具体判断
    return true
  },
  //space切换
  switchSpace(value){
    //更新用户默认cur_space
    let switchUrl = conf.getUrlData({ moduleName : "COMMON", pageName : "Head",
                                      type : "SPACE_SWITCH", spaceName : value });
    xhr({type: 'PUT',url: switchUrl,success:data=> {
        //需要切换space的权限
        auth.user.type = data;
        this.setState({cur_space:value});
        this.props.history.push({
          pathname:this.props.location.pathname,
          query: { cur_space:value },
          //state: { fromDashboard: true } 给下个route传值
        });
      }});
  },
  // 跳转到登录页
  login() {
    this.context.history.replaceState({
      referrer: this.props.location.pathname
    }, LOGIN_PATH)
  },

  // 安全退出
  handleLogout(e) {
    e.preventDefault()
    xhr({
      url: 'logout',
      success: () => {
        auth.destroy()
        this.login()
      }
    })
  },

  render() {

    let Children = this.props.children

    // 当前 URL 属于登录页时，不管是否登录，直接渲染登录页
    if (this.isInLogin()) return Children

    if (this.state.loggedIn) {

      if (!this.hasPermission()) {
        Children = <div>您无权访问该页面</div>
      }
      let cur_space = conf.getCurSpace(this);
      let params=`cur_space=${cur_space}`;
      return (
        <div id="wrapper" className="container-fluid">
          <div id="header" className="row">
            <Link to={env.basePath} className="logo">
              <img src={require('public/logo.png')} />
            </Link>
            <div className="pull-right">
              <span>space切换</span>
              <Select className="select-color" url="v1/user_auth/spaces/" value={this.state.cur_space} onChange={this.switchSpace} render={item => <Option value={item.space_name}>{item.space_name}</Option>} />
              &nbsp;&nbsp;欢迎您,{auth.user.name} &nbsp;|&nbsp;
              <a href="" onClick={this.handleLogout}>安全退出</a>
            </div>
          </div>
          <div id="body" className="row">
          {auth.user.cur_space != "" ? [
            <div className="sidebar col-md-2 col-sm-3">
              <Nav href={env.basePath}>
                <NavItem icon="signal" href={`?${params}`} title="概览" />
                <NavItem key={10} href="Service" icon="cloud" title="云服务">
                  <NavItem key={11} href="HDFS" icon="cubes" title="HDFS云">
                    <NavItem href={`HDFS/Myfile?${params}`} title="我的文件" />
                    <NavItem href={`HDFS/Share?${params}`} title="我的分享" />
                    <NavItem href={`HDFS/Trash?${params}`} title="我的回收站" />
                    <NavItem href={`HDFS/Service?${params}`} title="服务管理" />
                    <NavItem href={`HDFS/Capacity?${params}`} title="配额管理" />
                    <NavItem href={`HDFS/ShareCenter?${params}`} title="共享中心" />
                  </NavItem>

                  <NavItem key={12} href="CodisCloud" icon="skyatlas" title="Codis云">
                    <NavItem href={`CodisCloud/HostInfo?${params}`} title="主机信息" />
                    <NavItem href={`CodisCloud/CodisInfo?${params}`} title="Codis信息" />
                  </NavItem>
                </NavItem>

                  <NavItem key={20} href="CloudContainer" icon="sellsy" title="云容器">
                    <NavItem key={21} href="CloudContainer/CalcManage" icon="desktop" title="k8s相关监控">
                      <NavItem href={`CloudContainer/CalcManage/Overview?${params}`} title="概览" />
                      <NavItem href={`CloudContainer/CalcManage/PodInfo?${params}`} title="Pod信息" />
                      <NavItem href={`CloudContainer/CalcManage/ServiceInfo?${params}`} title="Service信息" />
                      <NavItem href={`CloudContainer/CalcManage/ReplicationControllerInfo?${params}`} title="RC信息" />
                    </NavItem>
                    {/* 暂时下面没有任何节点，因此注释掉
                    <NavItem key={22} icon="equalizer" title="Docker Image" />
                    */}
                    <NavItem key={23} href="CloudContainer/OffLineCalcTask" icon="tasks" title="离线计算任务" >
                      <NavItem href={`CloudContainer/OffLineCalcTask/MyTask?${params}`} title="我的任务" />                  
                    </NavItem>
                    {/** 暂时下面没有任何节点，因此注释掉
                    <NavItem key={24} icon="equalizer" title="storm实时计算任务" />
                    <NavItem key={25} icon="equalizer" title="Ceph" />
                    */}
                    <NavItem key={26} href="CloudContainer/UserDoc" icon="book" title="使用说明" >
                      <NavItem href={`CloudContainer/UserDoc/CC1?${params}`} title="开始使用 " />
                      <NavItem href={`CloudContainer/UserDoc/CC2?${params}`} title="云中心计算集群" />
                    </NavItem>
                   </NavItem>

                <NavItem key={30} href="openstack" icon="th-large" title="云主机">
                  <NavItem key={31} href="title" icon="th-large" title="计算">
                    <NavItem href="openstack/instances" title="虚拟机" />
                    <NavItem href="openstack/images" title="镜像" />
                    <NavItem href="openstack/flavors" title="云类型" />
                  </NavItem>
                  <NavItem key={32} href="volumes" icon="credit-card-alt" title="存储">
                    <NavItem href="openstack/volumes" title="云磁盘" />
                    <NavItem href="#" title="备份" />
                  </NavItem>
                </NavItem>

                <NavItem key={40} href="UserAuth" icon="th-large" title="用户管理">
                  <NavItem href={`UserAuth/SpaceList?${params}`} title="space列表" />
                </NavItem>

              </Nav>
            </div>
            ] : null}
            <div className="content col-md-10 col-sm-9">
              {Children}
            </div>
          </div>
          <div id="footer">
            <div className="pull-left">
              <a href="http://www.baifendian.com" className="logo">
                <img src={require('public/bfd.png')} />
              </a>
              <a href="http://www.baifendian.com/list.php?catid=32">公司简介</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="http://www.baifendian.com/list.php?catid=43">联系我们</a>&nbsp;&nbsp;|&nbsp;&nbsp;
              <a href="https://github.com/baifendian/Sirius/issues/new" target="_blank">提交issues</a>
            </div>
            <div className="pull-right">Copyright©2016 Baifendian Corporation All Rights Reserved.&nbsp;&nbsp;|&nbsp;&nbsp;京ICP备09109727号&nbsp;&nbsp;|&nbsp;&nbsp;京公网安备11010802010283号</div>
          </div>
        </div>
      )
    } else {
      return null
    }
  }
})

export default App
