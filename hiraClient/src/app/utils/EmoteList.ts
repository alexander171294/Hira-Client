export class EmoteList {

  public static readonly facesLocation = 'assets/faces/';
  public static readonly specialLocation = 'assets/specials/';
  public static readonly facesExtension = '.png';
  public static readonly memesLocation = 'assets/em-mem/';
  public static readonly memesExtension = '';

  public static readonly specialFaces = {
    'Gabriela-': [
      'regla',
      'magico'
    ]
  };

  public static readonly faces = [
    'aaa',
    'break',
    'chaky',
    'challenge',
    'cry',
    'ehh',
    'facepalm',
    'fap',
    'fffpf',
    'fu',
    'fuckyeah',
    'genius',
    'hmmm',
    'hpm',
    'jij',
    'laugh',
    'LOL',
    'magicBook',
    'magicCircle',
    'magicDrug',
    'magichat',
    'no',
    'oka',
    'rage',
    'siuu',
    'sparkle',
    'stickmagic',
    'stickmagic2',
    'trollface',
    'mog',
    'why',
    'WitchHat',
    'why',
    'yao',
    'true',
    'amazing',
    'forever',
    'notbad',
    'brindis',
    'buttcoin',
    'cigar',
    'cigar2',
    'coffee',
    'coffee2',
    'coffee3',
    'goatman',
    'hacker',
    'service',
    'stick',
    'wine',
    'wineBottle',
    'witchBroom',
    'principito',
    'baskerville'
  ];

  public static readonly memes = [
    'baneo',
    'baneo2',
    'baneo3',
    'buscar',
    'buscar2',
    'communicacion',
    'despedida',
    'expulsar',
    'hacker',
    'hacker2',
    'hacker3',
    'hacker4',
    'hacker5',
    'hacker6',
    'hacker7',
    'hacker8',
    'hacker9',
    'hacker10',
    'hacker11',
    'hacker12',
    'impuestos',
    'impuestos2',
    'llegada',
    'magia',
    'magia2',
    'magia3',
    'magia4',
    'magia5',
    'magia6',
    'nopreguntas',
    'nopreguntas2',
    'topic',
    'topic2'
  ];

  public static getMeme(name: string, author: string): string {
    if (this.memes.findIndex(meme => meme === name) >= 0) {
      return this.memesLocation + name + this.memesExtension;
    } else {
      return undefined;
    }
  }

  public static getFace(name: string, author: string): string {
    if (this.faces.findIndex(meme => meme === name) >= 0) {
      return this.facesLocation + name + this.facesExtension;
    } else if (this.specialFaces[author] &&
               this.specialFaces[author].findIndex(meme => meme === name) >= 0) {
      return this.specialLocation + name + this.facesExtension;
    } else {
      return undefined;
    }
  }
}
