/**
 * ST7789 TFT LCD Driver for micro:bit
 * 适用于金逸晨 GMT024-8p10p-SPI (2.4寸 240x320)
 * MakeCode PXT 扩展 - 修复兼容版
 */

//% color=#0078D7 icon="\uf108" block="ST7789 屏幕"
//% groups=["设置", "绘图", "文字", "高级"]
namespace st7789 {
    let _cs: DigitalPin = DigitalPin.P0;
    let _dc: DigitalPin = DigitalPin.P1;
    let _rst: DigitalPin = DigitalPin.P2;
    let _bl: DigitalPin = DigitalPin.P8;
    let _width: number = 240;
    let _height: number = 320;
    let _rotation: number = 0;
    let _initialized: boolean = false;

    const SWRESET = 0x01;
    const SLPOUT = 0x11;
    const NORON = 0x13;
    const INVOFF = 0x20;
    const INVON = 0x21;
    const DISPOFF = 0x28;
    const DISPON = 0x29;
    const CASET = 0x2A;
    const RASET = 0x2B;
    const RAMWR = 0x2C;
    const MADCTL = 0x36;
    const COLMOD = 0x3A;

    // 5x7 font data
    const FONT: number[][] = [
        [0x00,0x00,0x00,0x00,0x00],[0x00,0x00,0x5F,0x00,0x00],[0x00,0x07,0x00,0x07,0x00],
        [0x14,0x7F,0x14,0x7F,0x14],[0x24,0x2A,0x7F,0x2A,0x12],[0x23,0x13,0x08,0x64,0x62],
        [0x36,0x49,0x55,0x22,0x50],[0x00,0x05,0x03,0x00,0x00],[0x00,0x1C,0x22,0x41,0x00],
        [0x00,0x41,0x22,0x1C,0x00],[0x08,0x2A,0x1C,0x2A,0x08],[0x08,0x08,0x3E,0x08,0x08],
        [0x00,0x50,0x30,0x00,0x00],[0x08,0x08,0x08,0x08,0x08],[0x00,0x60,0x60,0x00,0x00],
        [0x20,0x10,0x08,0x04,0x02],[0x3E,0x51,0x49,0x45,0x3E],[0x00,0x42,0x7F,0x40,0x00],
        [0x42,0x61,0x51,0x49,0x46],[0x21,0x41,0x45,0x4B,0x31],[0x18,0x14,0x12,0x7F,0x10],
        [0x27,0x45,0x45,0x45,0x39],[0x3C,0x4A,0x49,0x49,0x30],[0x01,0x71,0x09,0x05,0x03],
        [0x36,0x49,0x49,0x49,0x36],[0x06,0x49,0x49,0x29,0x1E],[0x00,0x36,0x36,0x00,0x00],
        [0x00,0x56,0x36,0x00,0x00],[0x00,0x08,0x14,0x22,0x41],[0x14,0x14,0x14,0x14,0x14],
        [0x41,0x22,0x14,0x08,0x00],[0x02,0x01,0x51,0x09,0x06],[0x32,0x49,0x79,0x41,0x3E],
        [0x7E,0x11,0x11,0x11,0x7E],[0x7F,0x49,0x49,0x49,0x36],[0x3E,0x41,0x41,0x41,0x22],
        [0x7F,0x41,0x41,0x22,0x1C],[0x7F,0x49,0x49,0x49,0x41],[0x7F,0x09,0x09,0x01,0x01],
        [0x3E,0x41,0x41,0x51,0x32],[0x7F,0x08,0x08,0x08,0x7F],[0x00,0x41,0x7F,0x41,0x00],
        [0x20,0x40,0x41,0x3F,0x01],[0x7F,0x08,0x14,0x22,0x41],[0x7F,0x40,0x40,0x40,0x40],
        [0x7F,0x02,0x04,0x02,0x7F],[0x7F,0x04,0x08,0x10,0x7F],[0x3E,0x41,0x41,0x41,0x3E],
        [0x7F,0x09,0x09,0x09,0x06],[0x3E,0x41,0x51,0x21,0x5E],[0x7F,0x09,0x19,0x29,0x46],
        [0x46,0x49,0x49,0x49,0x31],[0x01,0x01,0x7F,0x01,0x01],[0x3F,0x40,0x40,0x40,0x3F],
        [0x1F,0x20,0x40,0x20,0x1F],[0x7F,0x20,0x18,0x20,0x7F],[0x63,0x14,0x08,0x14,0x63],
        [0x03,0x04,0x78,0x04,0x03],[0x61,0x51,0x49,0x45,0x43],[0x00,0x00,0x7F,0x41,0x41],
        [0x02,0x04,0x08,0x10,0x20],[0x41,0x41,0x7F,0x00,0x00],[0x04,0x02,0x01,0x02,0x04],
        [0x40,0x40,0x40,0x40,0x40],[0x00,0x01,0x02,0x04,0x00],[0x20,0x54,0x54,0x54,0x78],
        [0x7F,0x48,0x44,0x44,0x38],[0x38,0x44,0x44,0x44,0x20],[0x38,0x44,0x44,0x48,0x7F],
        [0x38,0x54,0x54,0x54,0x18],[0x08,0x7E,0x09,0x01,0x02],[0x08,0x14,0x54,0x54,0x3C],
        [0x7F,0x08,0x04,0x04,0x78],[0x00,0x44,0x7D,0x40,0x00],[0x20,0x40,0x44,0x3D,0x00],
        [0x00,0x7F,0x10,0x28,0x44],[0x00,0x41,0x7F,0x40,0x00],[0x7C,0x04,0x18,0x04,0x78],
        [0x7C,0x08,0x04,0x04,0x78],[0x38,0x44,0x44,0x44,0x38],[0x7C,0x14,0x14,0x14,0x08],
        [0x08,0x14,0x14,0x18,0x7C],[0x7C,0x08,0x04,0x04,0x08],[0x48,0x54,0x54,0x54,0x20],
        [0x04,0x3F,0x44,0x40,0x20],[0x3C,0x40,0x40,0x20,0x7C],[0x1C,0x20,0x40,0x20,0x1C],
        [0x3C,0x40,0x30,0x40,0x3C],[0x44,0x28,0x10,0x28,0x44],[0x0C,0x50,0x50,0x50,0x3C],
        [0x44,0x64,0x54,0x4C,0x44]
    ];
    const FONT_OFFSET = 32;

    function writeCmd(cmd: number): void {
        pins.digitalWritePin(_dc, 0);
        pins.digitalWritePin(_cs, 0);
        pins.spiWrite(cmd);
        pins.digitalWritePin(_cs, 1);
    }

    function writeData(data: number): void {
        pins.digitalWritePin(_dc, 1);
        pins.digitalWritePin(_cs, 0);
        pins.spiWrite(data);
        pins.digitalWritePin(_cs, 1);
    }

    function writeDataBuf(buf: Buffer): void {
        pins.digitalWritePin(_dc, 1);
        pins.digitalWritePin(_cs, 0);
        let rx = pins.createBuffer(buf.length);
        pins.spiTransfer(buf, rx);
        pins.digitalWritePin(_cs, 1);
    }

    function reset(): void {
        pins.digitalWritePin(_rst, 1);
        basic.pause(10);
        pins.digitalWritePin(_rst, 0);
        basic.pause(10);
        pins.digitalWritePin(_rst, 1);
        basic.pause(120);
    }

    function toRGB565(color: number): number {
        let r = (color >> 16) & 0xFF;
        let g = (color >> 8) & 0xFF;
        let b = color & 0xFF;
        return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | ((b & 0xF8) >> 3);
    }

    function colorBytes(color: number): Buffer {
        let c = toRGB565(color);
        let buf = pins.createBuffer(2);
        buf[0] = (c >> 8) & 0xFF;
        buf[1] = c & 0xFF;
        return buf;
    }

    function setWindow(x0: number, y0: number, x1: number, y1: number): void {
        let xbuf = pins.createBuffer(4);
        xbuf[0] = (x0 >> 8) & 0xFF; xbuf[1] = x0 & 0xFF;
        xbuf[2] = (x1 >> 8) & 0xFF; xbuf[3] = x1 & 0xFF;
        writeCmd(CASET);
        writeDataBuf(xbuf);

        let ybuf = pins.createBuffer(4);
        ybuf[0] = (y0 >> 8) & 0xFF; ybuf[1] = y0 & 0xFF;
        ybuf[2] = (y1 >> 8) & 0xFF; ybuf[3] = y1 & 0xFF;
        writeCmd(RASET);
        writeDataBuf(ybuf);

        writeCmd(RAMWR);
    }

    //% blockId=st7789_init
    //% block="初始化 ST7789 屏幕 CS %cs DC %dc RST %rst BL %bl 宽度 %width 高度 %height"
    //% weight=100
    //% group="设置"
    //% width.min=128 width.max=320 width.defl=240
    //% height.min=128 height.max=480 height.defl=320
    export function init(cs: DigitalPin, dc: DigitalPin, rst: DigitalPin, bl: DigitalPin, width: number, height: number): void {
        _cs = cs;
        _dc = dc;
        _rst = rst;
        _bl = bl;
        _width = width;
        _height = height;

        pins.spiFrequency(8000000);
        pins.spiFormat(8, 0);

        pins.digitalWritePin(_bl, 1);
        pins.digitalWritePin(_cs, 1);
        pins.digitalWritePin(_dc, 1);

        reset();

        writeCmd(SWRESET);
        basic.pause(150);
        writeCmd(SLPOUT);
        basic.pause(120);
        writeCmd(COLMOD);
        writeData(0x55);
        writeCmd(MADCTL);
        writeData(0x00);
        writeCmd(INVON);
        basic.pause(10);
        writeCmd(NORON);
        basic.pause(10);
        writeCmd(DISPON);
        basic.pause(120);

        _initialized = true;
    }

    //% blockId=st7789_init_default
    //% block="初始化 ST7789 (默认引脚)"
    //% weight=99
    //% group="设置"
    export function initDefault(): void {
        init(DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P8, 240, 320);
    }

    //% blockId=st7789_set_rotation
    //% block="设置旋转角度 %rotation"
    //% rotation.min=0 rotation.max=3
    //% weight=95
    //% group="设置"
    export function setRotation(rotation: number): void {
        _rotation = rotation & 0x03;
        let madctl = 0x00;
        if (_rotation == 0) madctl = 0x00;
        else if (_rotation == 1) madctl = 0x60;
        else if (_rotation == 2) madctl = 0xC0;
        else madctl = 0xA0;
        writeCmd(MADCTL);
        writeData(madctl);
    }

    //% blockId=st7789_backlight
    //% block="背光 %on"
    //% on.shadow=toggleOnOff
    //% weight=90
    //% group="设置"
    export function backlight(on: boolean): void {
        pins.digitalWritePin(_bl, on ? 1 : 0);
    }

    //% blockId=st7789_fill
    //% block="清屏颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=80
    //% group="绘图"
    export function fill(color: number): void {
        if (!_initialized) return;
        fillRect(0, 0, _width, _height, color);
    }

    //% blockId=st7789_pixel
    //% block="画点 x %x y %y 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=75
    //% group="绘图"
    export function pixel(x: number, y: number, color: number): void {
        if (!_initialized) return;
        if (x < 0 || x >= _width || y < 0 || y >= _height) return;
        setWindow(x, y, x, y);
        writeDataBuf(colorBytes(color));
    }

    //% blockId=st7789_fill_rect
    //% block="填充矩形 x %x y %y 宽 %w 高 %h 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=70
    //% group="绘图"
    export function fillRect(x: number, y: number, w: number, h: number, color: number): void {
        if (!_initialized) return;
        if (x < 0) { w += x; x = 0; }
        if (y < 0) { h += y; y = 0; }
        if (x + w > _width) w = _width - x;
        if (y + h > _height) h = _height - y;
        if (w <= 0 || h <= 0) return;

        setWindow(x, y, x + w - 1, y + h - 1);
        pins.digitalWritePin(_dc, 1);
        pins.digitalWritePin(_cs, 0);

        let cbuf = colorBytes(color);
        let rowBuf = pins.createBuffer(w * 2);
        for (let i = 0; i < w; i++) {
            rowBuf[i * 2] = cbuf[0];
            rowBuf[i * 2 + 1] = cbuf[1];
        }
        let rx = pins.createBuffer(w * 2);
        for (let row = 0; row < h; row++) {
            pins.spiTransfer(rowBuf, rx);
        }
        pins.digitalWritePin(_cs, 1);
    }

    //% blockId=st7789_rect
    //% block="矩形框 x %x y %y 宽 %w 高 %h 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=65
    //% group="绘图"
    export function rect(x: number, y: number, w: number, h: number, color: number): void {
        hline(x, y, w, color);
        hline(x, y + h - 1, w, color);
        vline(x, y, h, color);
        vline(x + w - 1, y, h, color);
    }

    //% blockId=st7789_hline
    //% block="水平线 x %x y %y 长度 %len 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=60
    //% group="绘图"
    export function hline(x: number, y: number, len: number, color: number): void {
        fillRect(x, y, len, 1, color);
    }

    //% blockId=st7789_vline
    //% block="垂直线 x %x y %y 长度 %len 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=59
    //% group="绘图"
    export function vline(x: number, y: number, len: number, color: number): void {
        fillRect(x, y, 1, len, color);
    }

    //% blockId=st7789_line
    //% block="直线 从 x %x0 y %y0 到 x %x1 y %y1 颜色 %color"
    //% color.shadow=colorNumberPicker
    //% weight=58
    //% group="绘图"
    export function line(x0: number, y0: number, x1: number, y1: number, color: number): void {
        if (!_initialized) return;
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = 1;
        let sy = 1;
        if (x0 >= x1) sx = -1;
        if (y0 >= y1) sy = -1;
        let err = dx - dy;

        while (true) {
            pixel(x0, y0, color);
            if (x0 == x1 && y0 == y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    //% blockId=st7789_circle
    //% block="圆 圆心 x %x y %y 半径 %r 颜色 %color || 填充 %fill"
    //% color.shadow=colorNumberPicker
    //% fill.defl=false
    //% weight=55
    //% group="绘图"
    export function circle(x: number, y: number, r: number, color: number, fill: boolean = false): void {
        if (!_initialized) return;
        let cx = 0;
        let cy = r;
        let d = 3 - 2 * r;

        while (cy >= cx) {
            if (fill) {
                hline(x - cx, y + cy, 2 * cx + 1, color);
                hline(x - cx, y - cy, 2 * cx + 1, color);
                hline(x - cy, y + cx, 2 * cy + 1, color);
                hline(x - cy, y - cx, 2 * cy + 1, color);
            } else {
                pixel(x + cx, y + cy, color);
                pixel(x - cx, y + cy, color);
                pixel(x + cx, y - cy, color);
                pixel(x - cx, y - cy, color);
                pixel(x + cy, y + cx, color);
                pixel(x - cy, y + cx, color);
                pixel(x + cy, y - cx, color);
                pixel(x - cy, y - cx, color);
            }
            cx++;
            if (d > 0) {
                cy--;
                d += 4 * (cx - cy) + 10;
            } else {
                d += 4 * cx + 6;
            }
        }
    }

    //% blockId=st7789_triangle
    //% block="三角形 顶点1 x %x0 y %y0 顶点2 x %x1 y %y1 顶点3 x %x2 y %y2 颜色 %color || 填充 %fill"
    //% color.shadow=colorNumberPicker
    //% fill.defl=false
    //% weight=50
    //% group="绘图"
    export function triangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: number, fill: boolean = false): void {
        if (!_initialized) return;
        if (fill) {
            let minY = y0;
            let maxY = y0;
            if (y1 < minY) minY = y1;
            if (y1 > maxY) maxY = y1;
            if (y2 < minY) minY = y2;
            if (y2 > maxY) maxY = y2;

            for (let y = minY; y <= maxY; y++) {
                let xStart = 10000;
                let xEnd = -10000;
                let t = _edgeX(y, y0, y1, x0, x1);
                if (t >= 0) { if (t < xStart) xStart = t; if (t > xEnd) xEnd = t; }
                t = _edgeX(y, y1, y2, x1, x2);
                if (t >= 0) { if (t < xStart) xStart = t; if (t > xEnd) xEnd = t; }
                t = _edgeX(y, y2, y0, x2, x0);
                if (t >= 0) { if (t < xStart) xStart = t; if (t > xEnd) xEnd = t; }

                if (xStart <= xEnd) {
                    hline(xStart, y, xEnd - xStart + 1, color);
                }
            }
        } else {
            line(x0, y0, x1, y1, color);
            line(x1, y1, x2, y2, color);
            line(x2, y2, x0, y0, color);
        }
    }

    function _edgeX(y: number, y0: number, y1: number, x0: number, x1: number): number {
        if (y0 == y1) {
            if (y == y0) return x0;
            return -1;
        }
        let min = y0;
        let max = y1;
        if (y1 < y0) { min = y1; max = y0; }
        if (y < min || y > max) return -1;
        return Math.round(x0 + (x1 - x0) * (y - y0) / (y1 - y0));
    }

    function _drawChar(x: number, y: number, ch: number, color: number, bg: number, scale: number): void {
        let idx = ch - FONT_OFFSET;
        if (idx < 0 || idx >= FONT.length) return;
        let cols = FONT[idx];
        let w = 5 * scale;
        let h = 7 * scale;

        if (x + w > _width || y + h > _height) return;
        if (x < 0 || y < 0) return;

        setWindow(x, y, x + w - 1, y + h - 1);
        pins.digitalWritePin(_dc, 1);
        pins.digitalWritePin(_cs, 0);

        let fg = colorBytes(color);
        let bgBuf = colorBytes(bg);
        let rx = pins.createBuffer(w * 2);

        for (let row = 0; row < 7; row++) {
            for (let rs = 0; rs < scale; rs++) {
                let lineBuf = pins.createBuffer(w * 2);
                let pos = 0;
                for (let col = 0; col < 5; col++) {
                    let bit = (cols[col] >> (6 - row)) & 1;
                    let src0 = fg[0];
                    let src1 = fg[1];
                    if (bit == 0) {
                        src0 = bgBuf[0];
                        src1 = bgBuf[1];
                    }
                    for (let cs = 0; cs < scale; cs++) {
                        lineBuf[pos] = src0;
                        lineBuf[pos + 1] = src1;
                        pos += 2;
                    }
                }
                pins.spiTransfer(lineBuf, rx);
            }
        }
        pins.digitalWritePin(_cs, 1);
    }

    //% blockId=st7789_text
    //% block="显示文字 x %x y %y 内容 %text 颜色 %color 背景 %bg 大小 %scale"
    //% color.shadow=colorNumberPicker
    //% bg.shadow=colorNumberPicker
    //% scale.min=1 scale.max=4 scale.defl=1
    //% weight=40
    //% group="文字"
    export function text(x: number, y: number, text: string, color: number, bg: number, scale: number): void {
        if (!_initialized) return;
        let spacing = 6 * scale;
        for (let i = 0; i < text.length; i++) {
            _drawChar(x + i * spacing, y, text.charCodeAt(i), color, bg, scale);
        }
    }

    //% blockId=st7789_number
    //% block="显示数字 x %x y %y 数字 %num 颜色 %color 背景 %bg 大小 %scale"
    //% color.shadow=colorNumberPicker
    //% bg.shadow=colorNumberPicker
    //% scale.min=1 scale.max=4 scale.defl=1
    //% weight=39
    //% group="文字"
    export function showNumber(x: number, y: number, num: number, color: number, bg: number, scale: number): void {
        text(x, y, num.toString(), color, bg, scale);
    }

    //% blockId=st7789_text_center
    //% block="居中文字 y %y 内容 %text 颜色 %color 背景 %bg 大小 %scale"
    //% color.shadow=colorNumberPicker
    //% bg.shadow=colorNumberPicker
    //% scale.min=1 scale.max=4 scale.defl=1
    //% weight=38
    //% group="文字"
    export function textCenter(y: number, str: string, color: number, bg: number, scale: number): void {
        if (!_initialized) return;
        let w = str.length * 6 * scale;
        let x = (_width - w) / 2;
        text(x, y, str, color, bg, scale);
    }

    //% blockId=st7789_invert
    //% block="反色显示 %invert"
    //% invert.shadow=toggleOnOff
    //% weight=30
    //% group="高级"
    export function invert(invert: boolean): void {
        writeCmd(invert ? INVON : INVOFF);
    }

    //% blockId=st7789_sleep
    //% block="屏幕睡眠"
    //% weight=25
    //% group="高级"
    export function sleep(): void {
        writeCmd(SLPOUT);
        basic.pause(120);
    }

    //% blockId=st7789_wake
    //% block="屏幕唤醒"
    //% weight=24
    //% group="高级"
    export function wake(): void {
        writeCmd(SLPOUT);
        basic.pause(120);
        writeCmd(DISPON);
        basic.pause(120);
    }

    //% blockId=st7789_width
    //% block="屏幕宽度"
    //% weight=20
    //% group="高级"
    export function screenWidth(): number {
        return _width;
    }

    //% blockId=st7789_height
    //% block="屏幕高度"
    //% weight=19
    //% group="高级"
    export function screenHeight(): number {
        return _height;
    }
}
