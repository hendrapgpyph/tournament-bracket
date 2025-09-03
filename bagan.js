var bagan_simpan = [];
var bagan_keluar_undi = [];
function GenerateBagan(currentPlayers) {
    bagan_keluar_undi = [];
    const $container = $('.bracket');
    $container.empty();
    let matchNum = 1;
    bagan_simpan = currentPlayers;
    let allRounds = [];
    let winnersMap = {};
    while (currentPlayers.length > 1) {
        const $round = $('<div class="round"></div>');
        const nextRoundPlayers = [];
        const roundMatches = [];

        // buat match per 2 pemain, jika tidak ada lawan → '--'
        for (let i = 0; i < currentPlayers.length; i += 2) {
            const p1 = currentPlayers[i];
            const p2 = currentPlayers[i + 1] || '--';

            const $match = $('<div class="match"></div>').attr('data-match', matchNum);
            if (TampilNamaKabupaten(p1) == '--') {
                $match.append(`<div class="player available none" data-pos="a">
                    ${p1}
                </div>`);
            } else {
                $match.append(`<div class="player available" data-pos="a">
                    <p class="mb-0 display-kabupaten" data-payload="${TampilNamaKabupaten(p1)}">--</p>
                    <p class="mb-0 display-nama" data-payload="${TampilNamaPemain(p1)}" style="font-size:11px;display:none">--</p>
                </div>`);
            }
            if (TampilNamaKabupaten(p2) == '--') {
                $match.append(`<div class="player available none" data-pos="b">
                    ${p2}
                </div>`);
            } else {
                $match.append(`<div class="player available" data-pos="b">
                    <p class="mb-0 display-kabupaten" data-payload="${TampilNamaKabupaten(p2)}">--</p>
                    <p class="mb-0 display-nama" data-payload="${TampilNamaPemain(p2)}" style="font-size:11px;display:none">--</p>
                </div>`);
            }
            $round.append($match);

            // jika ada bye, otomatis lolos ke ronde berikutnya
            if (p1 !== '--' && p2 === '--') nextRoundPlayers.push(p1);
            else if (p2 !== '--' && p1 === '--') nextRoundPlayers.push(p2);
            else nextRoundPlayers.push('--'); // placeholder untuk winner nanti

            roundMatches.push(matchNum);
            matchNum++;
        }

        $container.append($round);
        allRounds.push(roundMatches);
        currentPlayers = nextRoundPlayers;
    }

    // final winner box
    $container.append('<div class="round"><div id="winnerBox" class="final-winner">Belum ada</div></div>');

    // generate winnersMap otomatis
    for (let r = 0; r < allRounds.length; r++) {
        const roundMatches = allRounds[r];
        const nextRound = allRounds[r + 1] || [];
        roundMatches.forEach((m, i) => {
            if (nextRound.length > 0) {
                winnersMap[m] = {
                    next: nextRound[Math.floor(i / 2)],
                    pos: (i % 2 === 0) ? 'a' : 'b'
                };
            }
        });
    }

    function setPlayerIntoMatch(matchNum, pos, name, sourceMatch) {
        const $match = $('.match[data-match="' + matchNum + '"]');
        if ($match.length === 0) return;
        const $slot = $match.find('.player[data-pos="' + pos + '"]');
        $slot.html(name).data('from', sourceMatch).addClass('available');
        updateWinnerBox();
    }

    function updateWinnerBox() {
        const $final = $('.match').last();
        const a = $final.find('.player[data-pos="a"]').text();
        const b = $final.find('.player[data-pos="b"]').text();
        const $winnerBox = $('#winnerBox');
        const winner = $final.find('.player.winner').html();
        if (winner && winner !== '--') {
            $winnerBox.html(winner);
        } else if (a === '--' && b === '--') {
            $winnerBox.html('-');
        } else {
            $winnerBox.html('-');
        }
    }

    $(document).off('click', '.player.available');
    $(document).on('click', '.player.available', function () {
        const $this = $(this);
        const currentMatch = parseInt($this.closest('.match').data('match'));
        const name = $this.html();
        if (!name || name === '--') return;

        $this.siblings('.player').removeClass('winner');
        $this.addClass('winner');

        if (winnersMap[currentMatch]) {
            const map = winnersMap[currentMatch];
            setPlayerIntoMatch(map.next, map.pos, name, currentMatch);
        }
        updateWinnerBox();
    });

    updateWinnerBox();
    $('.round').eq(0).find('.match').each(function(){
        if($(this).find('.none').length > 0){
            $(this).find('.player').each(function(){
                $(this).find('p').each(function(){
                    $(this).removeClass('display-kabupaten');
                    $(this).removeClass('display-nama');
                });
            });
            $(this).css('visibility', 'hidden');
        }
    });
}

// PRE-PROCESSING PLAYER ARRAY UNTUK BYE
function preparePlayersArray(players) {
    const total = players.length;
    var newPlayers = [...players];
    newPlayers.reverse();

    if (total < 4) {
        // kurang dari 4 → kalau ganjil tambahin 1 bye
        if (total % 2 === 1) {
            newPlayers.push('--');
        }
    } else {
        // 4 atau lebih
        const remainder = total % 4;

        if (remainder === 2) {
            // kalau sisa 2 → tambahin 2 bye (biar jadi pasangan di round 1)
            newPlayers.splice(total - 1, 0, '--'); // selipin sebelum terakhir
            newPlayers.push('--');                 // tambah satu lagi di akhir
        } else if (remainder === 3) {
            // kalau sisa 3 → tambahin 1 bye
            newPlayers.push('--');
        }
    }
    newPlayers.reverse();
    return newPlayers;
}

function TampilNamaPemain(name) {
    if (name == '--') {
        return '--';
    }
    name = name.split("_");
    return name[0];
}
function TampilNamaKabupaten(name) {
    if (name == '--') {
        return '--';
    }
    name = name.split("_");
    return name[1];
}

function generateTablePemain(players) {
    let txt = ``;
    let urutan = 1;
    let players_acak = [...players];
    players_acak = shuffleArray(players_acak);
    players_acak.forEach((val, index) => {
        if (val != '--') {
            txt += `<tr class="display-data">
                            <td>${urutan}</td>
                            <td>${TampilNamaPemain(val)}</td>
                            <td>${TampilNamaKabupaten(val)}</td>
                        </tr>`;
            urutan++;
        }
    });
    $('#tbody-pemain').html(txt);
}

function generateUndian() {
    let display_nama = '';
    let display_kabupaten = '';
    let display_index = '';
    let bagans = [];
    bagan_simpan.forEach(val => {
        if(val != '--'){
            bagans.push(val);
        }
    });
    for (let index = 0; index < bagans.length; index++) {
        let payload_kabupaten = $('.display-kabupaten').eq(index).attr('data-payload');
        let payload_nama = $('.display-nama').eq(index).attr('data-payload');
        if (payload_kabupaten != '') {
            display_nama = payload_nama;
            display_kabupaten = payload_kabupaten;
            display_index = index;
            break
        }
    }
    if(display_index === ''){
        return;
    }
    Swal.fire({
      title: 'Mengundi urutan pemain..',
      html: `
        <span id="display_undi_kabupaten"></span><br>
        <span id="display_undi_nama"></span>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();

        // interval untuk update teks acak
        const interval = setInterval(() => {
          let bagan_acak = [];
          for (let index = 0; index < bagans.length; index++) {
            if(bagan_keluar_undi.indexOf(bagans[index]) === -1){
                bagan_acak.push(bagans[index]);
            }
          }
          const data_ambil = bagan_acak[Math.floor(Math.random() * bagan_acak.length)];
          let kab = TampilNamaKabupaten(data_ambil);
          let nm = TampilNamaPemain(data_ambil);
          document.getElementById("display_undi_kabupaten").textContent = kab;
          document.getElementById("display_undi_nama").textContent = nm;
        }, 150); // ganti angka buat kecepatan acak

        // setelah 5 detik, hentikan acak dan pilih final
        setTimeout(() => {
            clearInterval(interval);
            $('.display-kabupaten').eq(display_index).html(display_kabupaten);
            $('.display-nama').eq(display_index).html(display_nama);
            $('.display-kabupaten').eq(display_index).attr('data-payload', '');
            $('.display-nama').eq(display_index).attr('data-payload', '');
            $('.display-nama').eq(display_index).show();
            bagan_keluar_undi.push(display_nama+"_"+display_kabupaten);
            Swal.fire(display_kabupaten,display_nama,'success');
        }, bagan_keluar_undi.length == bagans.length - 1 ? 100 : 3000);
      }
    });
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    // ambil index random dari 0 sampai i
    const j = Math.floor(Math.random() * (i + 1));
    // tukar elemen arr[i] dengan arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}