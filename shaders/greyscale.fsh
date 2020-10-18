#version 120

#define Pr .299
#define Pg .587
#define Pb .114

uniform sampler2D texture;
varying vec4 texcoord;

void main() {
  vec4 color = texture2D(texture, texcoord.xy);
	float p = 0.7*sqrt(color.r * color.r * Pr + color.g * color.g * Pg + color.b * color.b * Pb);
  color.r = p;
  color.g = p;
  color.b = p;
  gl_FragColor = color;
}
