const Color = Java.type('java.awt.Color');
const File = Java.type('java.io.File');

export const PitPandaURL = 'https://pitpanda.rocks';
export const ModuleDir = `${Config.modulesFolder}/PitPanda`;
export const logo = new File(`${ModuleDir}/assets/logo.png`);
export const theColor = new Color(0,0,0,0.4);
export const theColorButForCTJS = 0x66000000;
export const white = new Color(1,1,1,0.8);
