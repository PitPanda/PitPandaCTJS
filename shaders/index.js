const GL20 = Java.type('org.lwjgl.opengl.GL20');
import { ModuleDir } from '../constants';

export const shaders = {
  greyscale: 0,
}

const loadPartialShader = (path, type) => {
  let shader = GL20.glCreateShader(type)
  GL20.glShaderSource(shader, FileLib.read(path))
  GL20.glCompileShader(shader)
  if(GL20.glGetShaderi(shader, GL20.GL_COMPILE_STATUS) != 1){ 
    console.log(`failed to compile shader at "${path}"`);
    return 0;
  }
  return shader;
}

const loadVectShader = path => loadPartialShader(path, GL20.GL_VERTEX_SHADER);
const loadFragShader = path => loadPartialShader(path, GL20.GL_FRAGMENT_SHADER);
const loadFullShader = (vecPath, fragPath) => {
  let prog = GL20.glCreateProgram();
  let vecS = loadVectShader(vecPath);
  let fragS = loadFragShader(fragPath);
  GL20.glAttachShader(prog, vecS)
  GL20.glAttachShader(prog, fragS)
  GL20.glLinkProgram(prog)
  if (GL20.glGetProgrami(prog, GL20.GL_LINK_STATUS) != 1) {
    console.log(`Shader for "${vecPath}" and "${fragPath}" failed to load`)
    return 0;
  }
  GL20.glValidateProgram(prog);
  if (GL20.glGetProgrami(prog, GL20.GL_VALIDATE_STATUS) != 1) {
    console.log('prog not validated');
    return 0;
  }
  GL20.glDetachShader(prog, vecS);
  GL20.glDetachShader(prog, fragS);
  GL20.glDeleteShader(vecS);
  GL20.glDeleteShader(fragS);
  return prog
}

const registerGreyscale = () => shaders.greyscale = loadFullShader(`${ModuleDir}/shaders/vec.vsh`, `${ModuleDir}/shaders/greyscale.fsh`);

let registerQueue = [registerGreyscale];

const setupRegister = register('renderWorld', () => {
  while(registerQueue.length) registerQueue.pop()();
  setupRegister.unregister();
});

export const hasShader = name => typeof shaders[name] === 'number';
export const useShaderId = id => GL20.glUseProgram(id);
export const useShader = name => hasShader(name) && useShaderId(shaders[name]);
export const exitShader = () => useShaderId(0);

register('gameUnload', () => {
  Object.values(shaders).forEach(prog => {
    GL20.glDeleteProgram(prog);
  });
});
