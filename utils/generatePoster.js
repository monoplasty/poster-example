/**
 * 绘制单行文本
 * @param {Object} obj
 */
function drawText(obj, ctx) {
  const { color, size, align, baseline, text, x, y, bold } = obj;
  ctx.save();
  ctx.fillStyle = color;
  ctx.setFontSize(size);
  ctx.setTextAlign(align);
  ctx.setTextBaseline(baseline);
  ctx.fillText(text, x, y);
  if (bold) {
    ctx.fillText(text, x, y - 0.5);
    ctx.fillText(text, x - 0.5, y);
  }
  ctx.fillText(text, x, y);
  if (bold) {
    ctx.fillText(text, x, y + 0.5);
    ctx.fillText(text, x + 0.5, y);
  }
  ctx.restore();
}

/**
 * 获取文本折行
 * @param {Object} obj
 * @return {Array} arrTr
 */
function getTextLine(obj, ctx) {
  const { size, text, width } = obj;
  const arrText = text.split("");
  const arrTr = [];
  let line = "";
  ctx.setFontSize(size);
  for (let i = 0; i < arrText.length; i++) {
    const testLine = line + arrText[i];
    const metrics = ctx.measureText(testLine);
    const textWidth = metrics.width;
    if (textWidth > width && i > 0) {
      arrTr.push(line);
      line = arrText[i];
    } else {
      line = testLine;
    }
    if (i == arrText.length - 1) {
      arrTr.push(line);
    }
  }
  return arrTr;
}

/**
 * 文本换行
 * @param {Object} obj
 */
function textWrap(obj, ctx) {
  const { x, y, height, color, size, align, baseline, bold, maxRow } = obj;
  const tr = getTextLine(obj, ctx);
  const row = tr.length;
  const minRow = Math.min(row, maxRow);
  // const txtHeightArr = [];
  // txtHeightArr.push(minRow * height);
  for (let i = 0; i < minRow; i++) {
    if (i < minRow) {
      let txt = {
        x,
        y: y + i * height,
        color,
        size,
        align,
        baseline,
        text: tr[i],
        bold
      };
      if (i == minRow - 1 && row > maxRow) {
        txt.text = txt.text.substring(0, txt.text.length - 2) + "......";
      }
      drawText(txt, ctx);
    }
  }
}

/**
 * 下载并绘制图片
 */
function downAndSetImage(ctx, url, x, y, width, height, isCircle) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success(res) {
        const { path, width: originalW, height: originalH } = res;
        height = (width * originalH) / originalW;
        if (isCircle) {
          drawCircleImg(ctx, path, x, y, width, height);
        } else {
          ctx.save();
          ctx.drawImage(path, x, y, width, height);
          ctx.restore();
        }
        resolve(1);
      },
      fail() {
        ctx.save();
        wx.showModal({
          title: "提示",
          content: "图片获取失败"
        });
        ctx.restore();
        reject("图片获取失败");
      },
      complete() {}
    });
  });
}

/**
 * 绘制圆形图片
 */
function drawCircleImg(ctx, src, x, y, width, heigth) {
  ctx.save(); // 先保存状态 已便于画完圆再用
  ctx.beginPath(); //开始绘制
  //先画个圆
  ctx.strokeStyle = "rgba(255,255,255,0)";
  ctx.arc(x + width / 2, y + heigth / 2, width / 2, 0, Math.PI * 2, false);
  ctx.stroke();
  ctx.clip();
  ctx.drawImage(src, x, y, width, heigth);
  ctx.restore();
}

/**
 * 开始用canvas绘制分享海报
 */
function sharePosteCanvas(params, callback) {
  const ctx = wx.createCanvasContext("myCanvas"); //创建画布
  wx.createSelectorQuery()
  .select("#canvas-container")
    .boundingClientRect(function (rect) {
    const pxToRpx = rect.height / (params.height + params.deltaHeight);
    ctx.fillStyle = '#E22A2A';
    ctx.fillRect(0, 0, rect.width, rect.height);
    // 白色
    roundRect(ctx, 20 * pxToRpx, 230 * pxToRpx, 550 * pxToRpx, (748 + params.deltaHeight) * pxToRpx, 20 * pxToRpx);
    drawPoster(ctx, rect, params, pxToRpx, callback);
    })
    .exec();
}

/**
 * canvas转图片路径
 * @param {function} callback
 */
function render(ctx, rect, callback) {
  ctx.draw(false, function() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
      destWidth: rect.width,
      destHeight: rect.height,
      canvasId: "myCanvas",
      quality: 1,
      success(res) {
        callback && callback(res.tempFilePath);
      },
      fail(e) {
        console.error('render error->', e);
      }
    });
  });
}

/**
 * 绘制海报
 * @param {Object} params
 * @param {function} callback
 */
function drawPoster(ctx, rect, params, pxToRpx, callback) {
  const p1 = downAndSetImage(
    ctx,
    params.qrcode,
    208 * pxToRpx,
    (params.height + params.deltaHeight - 125 - 172) * pxToRpx,
    172 * pxToRpx,
    172 * pxToRpx
  );
  // 头图
  const p2 = downAndSetImage(ctx, params.img, 0, 0, rect.width, 232 * pxToRpx);
  const p3 = downAndSetImage(ctx, params.prizeImg, 48 * pxToRpx, 258 * pxToRpx, 492 * pxToRpx, 247 * pxToRpx);
  Promise.all([p1, p2, p3]).then(() => {
    return downAndSetImage(ctx, params.avatar, 252 * pxToRpx, 16 * pxToRpx, 82 * pxToRpx, 82 * pxToRpx, true);
  })
    .then(() => {
      ctx.strokeStyle = '#FEC882';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(293 * pxToRpx, 57 * pxToRpx, 42 * pxToRpx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ellipsisText({
        x: 270 * pxToRpx,
        y: 114 * pxToRpx,
        color: '#fff',
        size: 24 * pxToRpx,
        align: "left",
        baseline: "top",
        text: params.nickname,
        bold: false,
      }, ctx, rect.width);
      ellipsisText({
        x: 196 * pxToRpx,
        y: 155 * pxToRpx,
        color: '#fff',
        size: 24 * pxToRpx,
        align: "left",
        baseline: "top",
        text: '发起了一个抽奖活动',
        bold: false,
      }, ctx, rect.width, 150);
      // 奖品
      const _len = params.prizes.length;
      let total = _len == 1 ? 20 : _len == 2 ? 15 : 0;
      for (let i = 0; i < _len; i++) {
        const ele = params.prizes[i];
        const title = {
          x: 48 * pxToRpx,
          y: 520 * pxToRpx + total,
          color: "#000",
          size: 26 * pxToRpx,
          align: "left",
          baseline: "top",
          text: ele.title,
          stock: ele.stock,
          bold: false,
          width: 494 * pxToRpx,
          height: 26 * pxToRpx,
          maxRow: 2
        };
        total += diffColor(title, pxToRpx, ctx)
      }

      // 活动时间
      const time = {
        x: 48 * pxToRpx,
        y: 520 * pxToRpx + total + 18 * pxToRpx,
        color: "rgba(103,113,126,1)",
        size: 24 * pxToRpx,
        align: "left",
        baseline: "top",
        text: params.time,
        bold: false
      };
      drawText(time, ctx);

      drawLine(ctx, 48 * pxToRpx, (params.height + params.deltaHeight - 150 - 172) * pxToRpx, 542 * pxToRpx, (params.height + params.deltaHeight - 150 - 172) * pxToRpx);
      drawLine(ctx, 48 * pxToRpx, (params.height + params.deltaHeight - 156 - 172) * pxToRpx, 542 * pxToRpx, (params.height + params.deltaHeight - 156 - 172) * pxToRpx);

      // 底部文案
      const tips = {
        x: 150 * pxToRpx,
        y: (params.height + params.deltaHeight - 92) * pxToRpx,
        color: "rgba(103,113,126,1)",
        size: 24 * pxToRpx,
        align: "left",
        baseline: "top",
        text: "长按识别小程序，参与抽奖",
        bold: false
      };
      drawText(tips, ctx);
    })
    .then(() => {
      render(ctx, rect, callback);
    });
}

/**
 * 点击保存到相册
 */
function saveShareImg() {
  wx.showLoading({
    title: "正在保存",
    mask: true
  });
  setTimeout(function() {
    wx.canvasToTempFilePath({
      canvasId: "myCanvas",
      success: function(res) {
        wx.hideLoading();
        var tempFilePath = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success(res) {
            wx.showModal({
              content: "图片已保存到相册，赶紧去分享吧~",
              showCancel: false,
              confirmText: "好的",
              confirmColor: "#333",
              success: function(res) {
                if (res.confirm) {
                }
              },
              fail: function(res) {}
            });
          },
          fail: function (e) {
            if (e.errMsg.indexOf('auth deny') > -1) {
              wx.showModal({
                title: '提示',
                content: `您已拒绝该授权，如需重新授权，请前往重新设置`,
                confirmText: '立即前往',
                success(e) {
                  if (e.confirm) {
                    wx.openSetting({
                      success (res) {
                        // console.log(res)
                      }
                    })
                  }
                },
              })
            }
          }
        });
      }
    });
  }, 1000);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.fillStyle = '#fff';
  ctx.lineJoin = 'round';
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.lineTo(x + w, y + r)
  ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)
  ctx.lineTo(x + w, y + h - r)
  ctx.lineTo(x + w - r, y + h)
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)
  ctx.lineTo(x + r, y + h)
  ctx.lineTo(x, y + h - r)
  ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x + r, y)
  ctx.fill()
  ctx.closePath()
}

function diffColor(title, pxToRpx, ctx) {
  textWrap(title, ctx);
  const metrics = ctx.measureText(title.text);
  const w = metrics.width;
  const fix = ctx.measureText('一等奖：');
  const sub = ctx.measureText(title.stock);
  if (w + 10 + sub.width > title.width) {
    drawText({
      x: title.x + fix.width,
      y: title.y + 4 * pxToRpx + title.height,
      color: '#B0B0B0',
      size: 22 * pxToRpx,
      align: "left",
      baseline: "top",
      text: title.stock,
      bold: false,
    }, ctx);
    return 14 * pxToRpx + title.height + 22 * pxToRpx;
  } else {
    drawText({
      x: title.x + w + 10,
      y: title.y + 4 * pxToRpx,
      color: '#B0B0B0',
      size: 22 * pxToRpx,
      align: "left",
      baseline: "top",
      text: title.stock,
      bold: false,
    }, ctx);
    return title.height + 4 * pxToRpx;
  }
}

function drawLine(ctx, x, y, x1, y1) {
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.stroke();
}

function ellipsisText(obj, ctx, W, width = 120) {
  const { text, size } = obj;
  const tr = getTextLine({ text, size, width }, ctx);
  let txt = tr[0];
  if (tr.length > 1) {
    txt += '...'
  }
  ctx.setFontSize(size);
  const metrics = ctx.measureText(txt).width;
  obj.x = Math.floor((W - metrics) / 2);
  obj.text = txt;
  drawText(obj, ctx)
}

export { sharePosteCanvas, saveShareImg };
