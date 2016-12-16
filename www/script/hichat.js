window.onload = function () {
    var chat = new Chat();
    chat.init();
};

var Chat = function () {
    this.socket = null;
};

Chat.prototype = {
    init: function () {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function () {
            document.getElementById('info').textContent = 'get your nick name';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();

            document.getElementById('loginBtn').addEventListener('click', function () {
                var nickname = document.getElementById('nicknameInput').value;
                if (nickname.trim().length != 0)
                    that.socket.emit('login', nickname);
                else
                    document.getElementById('nicknameInput').focus();
            }, false);
        });
        this.socket.on('nickExist', function () {
            document.getElementById('info').textContent = 'nickname is taken, choose another one.';
        });

        this.socket.on('loginSuccess', function () {
            document.title = 'hichat' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();

        });
        this.socket.on('system', function (nickname, usercount, type) {
            var msg = nickname + (type == 'login' ? 'joined' : 'left');
            that._displayHistory('system', msg, 'red');
            // var p = document.createElement('p');
            // p.textContent = msg;
            // document.getElementById('historyMsg').appendChild(p);
            document.getElementById('status').textContent = usercount + (usercount > 1 ? 'users' : ' user ') + 'online';
        });

        this.socket.on('newMsg', function (user, msg, color) {
            that._displayHistory(user, msg, color);
        });

        this.socket.on('newImg', function (user, imageData) {
            that._displayImage(user, imageData);
        })

        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
                var nickname = document.getElementById('nicknameInput').value;
                if (nickname.trim().length != 0)
                    that.socket.emit('login', nickname);
                else
                    document.getElementById('nicknameInput').focus();
            }
        }, false);

        document.getElementById('messageInput').addEventListener('keyup', function (e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayHistory('me', msg, color);
            }
        }, false);

        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayHistory('me', msg, color);
            }
        });
        document.getElementById('sendImage').addEventListener('change', function () {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayHistory('system', 'your browser does not support fileReader.', 'red');
                    return;
                }
                reader.onload = function (e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                }
                reader.readAsDataURL(file);
            }
        });

        this._initEmojiImage();
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiWrapper = document.getElementById('emojiWrapper');
            emojiWrapper.style.display = 'block';
            e.stopPropagation();   //stop send any event.
        }, false);
        document.body.addEventListener('click', function (e) {
            var emojiWrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiWrapper) {
                emojiWrapper.style.display = 'none';
            }
        });
        //get which emoji is clicked.
        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']'
            }
        }, false);
    },

    _showEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif"/>');
            }
        }
        return result;
    },

    _initEmojiImage: function () {
        var emojiWrapper = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 1; i < 69; i++) {
            var emoji = document.createElement('img');
            emoji.src = '../content/emoji/' + i + '.gif';
            emoji.title = i;
            docFragment.appendChild(emoji);
        }
        emojiWrapper.appendChild(docFragment);
    },

    _displayImage: function (user, imageData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substring(0, 8);
        msgToDisplay.style.color = color || '#000'
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '</span>): ' + '<img src="' + imageData + '"></img>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },

    _displayHistory: function (user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substring(0, 8);

        msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000'
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '</span>): ' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    }
};
