import { sharePosteCanvas, saveShareImg } from "../../utils/generatePoster";

//Page Object
Page({
  data: {
    canvasStyle: '',
    imgStyle: '',
    resultImg: '',
  },
  onLoad: function(options) {
    const { height, width } = options;
    const w = Math.floor((width / height) * 1028);
    this.setData({
      canvasStyle: `width:${width}rpx;height:${height}rpx`,
      imgStyle: `width:${w}rpx;height:${1028}rpx`,
    });
    const that = this;
    const eventChannel = that.getOpenerEventChannel();
    eventChannel.on("syncPosterData", function(params) {

      wx.showLoading({
        title: "正在生成海报...",
        mask: true
      });
      // 这里需要获取小程序二维码，具体方法可以关注公众号 'ruanjianxiaoyu' 后台留言
      params.qrcode = 'https://img-blog.csdnimg.cn/2020022711573788.png'; // 这里采用本地路径
      sharePosteCanvas(params, function(tempFilePath) {
        that.setData({ resultImg: tempFilePath });
        wx.hideLoading();
      });
    });
  },
  // 保存分享图
  save() {
    saveShareImg();
  },
  
});
