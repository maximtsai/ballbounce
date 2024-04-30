const imageFilesPreload = [
    {name: 'blackPixel', src: 'sprites/black_pixel.png'},
    {name: 'ball', src: 'sprites/ball.png'},
    {name: 'ball2', src: 'sprites/ball2.png'},
    {name: 'ball_hit_box', src: 'sprites/ball_hit_box.png'},
];

const imageAtlases = [

];

const imageFiles = [
];

// Utility function for loading stuff
function loadFileList(scene, filesList, type) {
    for (let i in filesList) {
        let data = filesList[i];
        switch (type) {
            case 'audio':
                scene.load.audio(data.name, data.src);
                break;
            case 'image':
                scene.load.image(data.name, data.src);
                break;
            case 'bitmap_font':
                scene.load.bitmapFont(data.name, data.imageUrl, data.url);
                break;
            case 'atlas':
                scene.load.multiatlas(data.name, data.src);
                break;
            default:
                console.warn('unrecognized type: ', type);
                break;
        }
    }
}
