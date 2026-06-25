import IPreset from '../interfaces/IPreset.ts'
import IRule from '../interfaces/IRule.ts';
import parser from 'npm:@babel/parser';
import { default as traverse } from 'npm:@babel/traverse';
import generate from 'npm:@babel/generator';
import Logger from '../../../../shared/modules/logger/logger.ts'

export default abstract class Preset implements IPreset {
  rules: IRule[] = [];
  transform(code: string, args?: any) {
    if (!this.rules) {
      throw new Error('Rules not defined')
    }

    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      tokens: true,
    });

    this.rules.forEach(rule => {
      Logger.log(`Applying rule ${rule.name}`)
      traverse.default(ast, rule.getVisitor(args))
    })

    const output = generate.default(ast, {
      retainLines: true,
      comments: true,
      compact: false,
      concise: false,
      experimental_preserveFormat: true,
    }, code);
    Logger.log(`Applied rules`)
    return output.code;
  }
}