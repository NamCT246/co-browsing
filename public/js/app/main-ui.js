define([
  'require',
  'jquery',
  'hangman',
  'socket'
], function (require, $, hangman, socket) {
  'use strict';

  var ui = {};
  var COLORS = ['#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  ui.getUserColor = function (username) {
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  ui.updateProgress = function (data) {
    console.log(data);
    hangman.currWord = hangman.wrd = hangman._wordData(data.word);
    hangman.wrongGuesses = data.wrongGuesses;
    hangman.init();
    hangman.redraw(data);
  }

  ui.sendProgress = function (user) {
    var currentWord = hangman.wrd,
      rightLetters = hangman.rightGuesses,
      wrongGuesses = hangman.wrongGuesses,
      progress = {
        word: currentWord,
        shownLetters: [],
        wrongGuess: wrongGuesses,
        to: user
      };

    $.each(currentWord.letters, function (key, val) {
      $.each(rightLetters, function (k, v) {
        if (v === val.letter.toLowerCase()) {
          progress.shownLetters.push({
            letter: val.letter,
            pos: key
          })
        }
      })
    });


    socket.connection.emit('progress', progress)
  }

  return ui;
});