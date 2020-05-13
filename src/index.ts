'use strict';

import { getElement, getRandomInt, getCapitalPercentage } from './utils';

interface spacesModifier {
  facePercentage: number;
  actionPercentage: number;
  stutterPercentage: number;
}

export class Uwuifier {
  public faces: string[] = [`(・\`ω´・)`, `;;w;;`, `owo`, `UwU`, `>w<`, `^w^`, `ÚwÚ`, `:3`, `x3`];
  public actions: string[] = [
    `*blushes*`,
    `*whispers to self*`,
    `*sweats*`,
    `*sees buldge*`,
    `*runs away*`,
    `*huggles tightly*`,
    `*boops your nose*`,
    `*starts twerking*`
  ];
  public exclimations: string[] = [`?!!`, `?!?1`, `!!11`, `?!?!`, `!?`];

  @InitModifierParam()
  private _spacesModifier: spacesModifier = { facePercentage: 0.05, actionPercentage: 0.05, stutterPercentage: 0.1 };
  @InitModifierParam()
  private _wordsModifier: number = 1;
  @InitModifierParam()
  private _exclimationsModifier: number = 1;

  constructor(spacesModifierPara?: spacesModifier, wordsModifierPara?: number, exclimationsModifierPara?: number) {
    if (typeof exclimationsModifierPara !== 'undefined') this._exclimationsModifier = exclimationsModifierPara;
    if (typeof spacesModifierPara !== 'undefined') this._spacesModifier = spacesModifierPara;
    if (typeof wordsModifierPara !== 'undefined') this._wordsModifier = wordsModifierPara;
  }

  public uwuifyWords(sentence: string): string {
    let uwuifiedSentence = ``;

    // Split the string into words
    const words = sentence.split(` `);
    const random = Math.random();
    const pattern = new RegExp(/(?:https?|ftp):\/\/[\n\S]+/g);
    const uwuMap = [
      [/(?:r|l)/g, `w`],
      [/(?:R|L)/g, `W`],
      [/n([aeiou])/g, `ny$1`],
      [/N([aeiou])/g, `Ny$1`],
      [/N([AEIOU])/g, `Ny$1`],
      [/ove/g, `uv`]
    ];

    words.forEach((wordValue, wordIndex) => {
      // If word is a URL don't uwuifiy it
      if (!pattern.test(wordValue) && random <= this._wordsModifier) {
        for (const [oldWord, newWord] of uwuMap) {
          wordValue = wordValue.replace(oldWord, newWord as string);
        }
      }

      // Reconstruct the string with uwuified words
      uwuifiedSentence += wordIndex === 0 ? wordValue : ` ${wordValue}`;
    });

    return uwuifiedSentence;
  }

  public uwuifySpaces(sentence: string): string {
    let uwuifiedSentence = ``;

    // Split the string into words
    const words = sentence.split(` `);

    words.forEach((wordValue, wordIndex) => {
      // TODO: use seed value
      const random = Math.random();
      const pattern = new RegExp(/(?:https?|ftp):\/\/[\n\S]+/g);

      let insertedExpression = false;
      let removeCapital = false;

      const faceThreshold = this._spacesModifier.facePercentage;
      const actionThreshold = this._spacesModifier.actionPercentage + faceThreshold;
      const stutterThreshold = this._spacesModifier.stutterPercentage + actionThreshold;

      if (random <= faceThreshold && this.faces.length) {
        // Add random face before the word
        uwuifiedSentence += ` ${getElement(this.faces)}`;
        insertedExpression = true;
      } else if (random <= actionThreshold && this.actions.length) {
        // Add random action before the word
        uwuifiedSentence += ` ${getElement(this.actions)}`;
        insertedExpression = true;
      } else if (random <= stutterThreshold) {
        // If first character is defined
        if (wordValue[0]) {
          // If string isn't a URL
          if (!pattern.test(wordValue)) {
            // Add stutter with a length between 0 and 2 length
            const letter = wordValue[0];
            const stutter = getRandomInt(0, 2);

            for (let i = 0; i < stutter; i++) {
              wordValue = `${letter}-${wordValue}`;
            }
          }
        }
      }

      // If we added a face or action
      if (insertedExpression) {
        // Check if we should remove the first capital letter
        if (wordValue[0] && wordValue[0] === wordValue[0].toUpperCase()) {
          if (wordIndex === 0) {
            // If it's the first word and has less than 50% upper case
            if (getCapitalPercentage(wordValue) <= 0.5) removeCapital = true;
          }

          if (wordIndex !== 0) {
            // If the previous word ends with punctuation continue with the logic
            const previousWord = words[wordIndex - 1];
            const previousWordLast = previousWord[previousWord.length - 1];

            if (new RegExp('[.!?\\-]').test(previousWordLast)) {
              // If the current word has less than 50% upper case
              if (getCapitalPercentage(wordValue) <= 0.5) removeCapital = true;
            }
          }
        }
      }

      // Remove the first capital letter if needed
      wordValue = removeCapital ? `${wordValue.charAt(0).toLowerCase()}${wordValue.slice(1)}` : wordValue;

      // Reconstruct the string
      uwuifiedSentence += wordIndex === 0 ? wordValue : ` ${wordValue}`;
    });

    return uwuifiedSentence;
  }

  public uwuifyExclimations(sentence: string): string {
    let uwuifiedSentence = ``;

    // Split the string into words
    const words = sentence.split(` `);
    const pattern = new RegExp('[?!]+$');

    words.forEach((wordValue, wordIndex) => {
      const random = Math.random();

      // If there are exclimations replace them
      if (pattern.test(wordValue)) {
        if (random <= this._exclimationsModifier) {
          wordValue = wordValue.replace(pattern, ``);
          wordValue += getElement(this.exclimations);
        }
      }

      // Reconstruct the string
      uwuifiedSentence += wordIndex === 0 ? wordValue : ` ${wordValue}`;
    });

    return uwuifiedSentence;
  }

  public uwuifySentence(sentence: string): string {
    let uwuifiedString = sentence;

    uwuifiedString = this.uwuifyWords(uwuifiedString);
    uwuifiedString = this.uwuifyExclimations(uwuifiedString);
    uwuifiedString = this.uwuifySpaces(uwuifiedString);

    return uwuifiedString;
  }
}

function InitModifierParam() {
  return function (target: { [key: string]: any }, key: string) {
    let value = target[key];

    const getter = () => value;

    const setter = (next: number | object) => {
      if (typeof next === 'object') {
        next = Object.values(next).reduce((a, b) => a + b);
      }

      if (next < 0 || next > 1) {
        throw new Error(`${key} modifier value must be a number between 0 and 1`);
      }

      value = next;
    };

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}
