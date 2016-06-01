/**
 * Created by matt1201 on 2016/3/25.
 */

function image(w, h)
{
    this.header = '';
    this.data = Array();
    this.width = w;
    this.height = h;
}
// Convert a value to a little endian hexadecimal value
function getLittleEndianHex(value)
{
    var result = [];

    for (var bytes = 4; bytes > 0; bytes--)
    {
        result.push(String.fromCharCode(value & 255));
        value >>= 8;
    }
    return result.join('');
}
// Set the required bitmap header
// Set the required bitmap header
function setImageHeader(img)
{
    var numFileBytes = getLittleEndianHex(img.width * img.height);
    var w = getLittleEndianHex(img.width);
    var h = getLittleEndianHex(img.height);

    img.header =
        'BM' +                    // Signature
        numFileBytes +            // size of the file (bytes)*
        '\x00\x00' +              // reserved
        '\x00\x00' +              // reserved
        '\x36\x00\x00\x00' +      // offset of where BMP data lives (54 bytes)
        '\x28\x00\x00\x00' +      // number of remaining bytes in header from here (40 bytes)
        w +                       // the width of the bitmap in pixels*
        h +                       // the height of the bitmap in pixels*
        '\x01\x00' +              // the number of color planes (1)
        '\x20\x00' +              // 32 bits / pixel
        '\x00\x00\x00\x00' +      // No compression (0)
        '\x00\x00\x00\x00' +      // size of the BMP data (bytes)*
        '\x13\x0B\x00\x00' +      // 2835 pixels/meter - horizontal resolution
        '\x13\x0B\x00\x00' +      // 2835 pixels/meter - the vertical resolution
        '\x00\x00\x00\x00' +      // Number of colors in the palette (keep 0 for 32-bit)
        '\x00\x00\x00\x00';       // 0 important colors (means all colors are important)
}
// Flip image vertically
function flipImage(img)
{
    var newImgData = new Array();

    for(var x = 0; x < img.width; x++)
    {
        for(var y = 0; y < img.height; y ++)
        {
            var ny = img.height - 1 - y;
            newImgData[(ny * img.width) + x] = img.data[(y * img.width) + x];
        }
    }
    img.data = newImgData;
}
function background(img, x, y, w, h, color)
{
    for (var ny = y; ny < y + h; ny++)
    {
        for (var nx = x; nx < x + w; nx++)
        {
            img.data[ny * img.width + nx] = color;
        }
    }
}
// Fill a rectangle
function fillRectangle(img, x, y, w, h, color)
{
    for (var ny = y; ny < y + h; ny++)
    {
        for (var nx = x; nx < x + w; nx++)
        {
            if(nx == x || ny == y || ny == y+h-1 || nx == x+w-1)
                img.data[ny * img.width + nx] = String.fromCharCode(204, 204, 204, 0);
            else
                img.data[ny * img.width + nx] = color;
        }
    }
}
//Draw pixel
function drawPixel(img, x, y, color)
{
    fillRectangle(img, x, y, 10, 10, color);
}
// Main draw function
function cGreen()
{
    return String.fromCharCode(152, 255, 195, 0);
}
function cOrange()
{
    return String.fromCharCode(12, 160, 232, 0);
}
function cRed()
{
    return String.fromCharCode(0, 0, 255, 0);
}
function cBlue()
{
    return String.fromCharCode(232, 12, 58, 0);
}
function cTurquoise()
{
    return String.fromCharCode(232, 255, 13, 0);
}

//definition de la racine de l'arbre
function drawRoot(taille)
{
    if (taille > 340)
        taille = 340;

}
function drawImage()
{
    var img = new image(90, 90);

    setImageHeader(img);
    //background(img, 0, 0, img.width, img.height, String.fromCharCode(255, 255, 255, 0));

    var x = 0;
    var y = 0;

    //drawRoot(name.charCodeAt(0));
    //for (var i = 1; i < name.length; i++)
    //{
    //    drawPixel(img, i * size, size, cTurquoise());
    //    // console.log("i:"+i+" x*10:"+i*size);
    //}

    // String.fromCharCode(255, 0, 0, 0) BGR [and not RGB]
    // drawPixel(img, 100, 150, String.fromCharCode(255, 0, 0, 0));
    fillRectangle(img, 0, 0, 90, 90, String.fromCharCode(255, 0, 0, 0)); // Blue
    //fillRectangle(img, 110, 10, 90, 90, String.fromCharCode(0, 255, 0, 0)); // Green
    // fillRectangle(img, 10, 110, 90, 90, String.fromCharCode(0, 0, 255, 0)); // Red

    // Flip image vertically
    //flipImage(img);

    // If window.btoa is supported, use it since it's often faster
    if(window.btoa != undefined) {
        return 'data:image/bmp;base64,' + btoa(img.header + img.data.join(""));
    }
    // If not, use our base64 library
    else {
        return 'data:image/bmp;base64,' + $.base64.encode(img.header + img.data.join(""));
    }
}
