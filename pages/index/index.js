//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  savePost() {
    const _prizes = [];
    for (let i = 0; i < 2; i++) {
      _prizes.push({
        imgSrc: "https://img-blog.csdnimg.cn/20200227115727364.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L21vbm9wbGFzdHk=,size_16,color_FFFFFF,t_70",
        title: '体验课体验课体验课体验课体验课',
        details: {stock: 24},
      })
    }
    const compute = this._handleCalcPrizes(_prizes);
    const H = 1028;
    wx.navigateTo({
      url: `../poster/poster?width=588&height=${H + compute.height}`,
      success(res) {
        res.eventChannel.emit('syncPosterData', {
          data: {
          },
          height: H,
          deltaHeight: compute.height,
          avatar: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eouoXSO56SbOKnTk1veruvx4A7XnU4NNrrhDUqaYP2NTcevuvQ17PV3JcjbicYhdoqHWVpy8mJIJicA/132',
          // avatar: publisher.avatar_url,
          nickname: 'monoplasty',
          // 头图
          img: 'https://img-blog.csdnimg.cn/20200227115712946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L21vbm9wbGFzdHk=,size_16,color_FFFFFF,t_70',
          // 奖品图
          prizeImg: compute.img,
          prizes: compute.text,
          time: '2020-12-20 自动开奖',
        })
      }
    });
  },
  _handleCalcPrizes(prizes) {
    const numberMap = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    let height = 0;
    const text = [];
    let img = '';
    const width = 494;
    prizes.forEach((item, idx) => {
      if (idx == 0) {
        img = item.imgSrc;
      }
      const txt = {
        title: `${numberMap[idx]}等奖：${item.title}`,
        stock: `x${item.details.stock}份`
      }
      text.push(txt);
      if (idx >= 2) {          
        if (txt.title.length * 26 + txt.stock.length * 20 + 20 > width) {
          height += (26 + 10 + 22 + 5)
        } else {
          height += 36
        }
      }
    });
    return { height, img, text };
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
