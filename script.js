/* ===== ZMIENNE GLOBALNE ===== */
let timerInterval = null; // Przechowuje nasz interwał zegara
let czasPozostaly = 20 * 60; // 20 minut * 60 sekund
let czyGraAktywna = false; // Zapobiega podwójnemu zakończeniu gry
let modalCallback = null; // Funkcja do wywołania po zamknięciu modala

// Teksty do animacji pisania (możesz je dowolnie zmieniać)
// Użyj `\n` aby zrobić nową linię
const TEKST_FAZA_1 = "Witaj...\nNazywają mnie 'Widmo'. \nWłaśnie przejąłem kontrolę nad Twoim urządzeniem. \n\nWidzę, że masz na nim coś, co należy do mojej przyjaciółki, Zosi. Lepiej to odzyskaj, zanim będzie za późno. \n\nUruchomiłem tryb awaryjny. Masz 20 minut, zanim sformatuję Ci dysk. Powodzenia.";
const TEKST_FAZA_2 = "Świetnie. Pierwszy krok za Tobą. \nAle to była tylko rozgrzewka. \n\nZaszyfrowałem kopię zapasową Zosi. Jeśli jej nie odzyskasz, straci wszystkie swoje dane. \n\nKlucz do odszyfrowania podzieliłem na trzy części. Zdobądź je wszystkie.";
const TEKST_FAZA_3 = "Widzę, że umiesz myśleć logicznie... \nAle czy potrafisz też myśleć... nieszablonowo? \n\nKolejna część klucza jest ukryta w systemie weryfikacji. Złam go.";

/* ===== GŁÓWNA FUNKCJA NAWIGACYJNA ===== */

/**
 * Pokazuje wybrany ekran (fazę) i ukrywa resztę.
 * @param {string} idEkranu ID ekranu do pokazania (np. 'faza-2')
 */
function pokazEkran(idEkranu) {
    // Ukryj wszystkie ekrany
    const ekrany = document.querySelectorAll('.ekran');
    ekrany.forEach(ekran => {
        ekran.classList.remove('aktywny');
    });

    // Pokaż wybrany ekran
    const aktywnyEkran = document.getElementById(idEkranu);
    if (aktywnyEkran) {
        aktywnyEkran.classList.add('aktywny');
    }

    // Specjalna logika przy wejściu na konkretne fazy
    if (idEkranu === 'faza-2' && !czyGraAktywna) {
        // Pierwsze wejście na fazę 2 - startujemy timer
        startTimera();
    } else if (idEkranu === 'faza-4') {
        // Uruchom pisanie tekstu w fazie 4
        efektPisania('tekst-pisany-3', TEKST_FAZA_3, () => {
            document.getElementById('przycisk-faza-4-start').classList.remove('ukryty');
        });
    } else if (idEkranu === 'faza-5') {
        // Faza 5 zaczyna się od filmu
        uruchomFilmFazy5();
    } else if (idEkranu === 'faza-6-wygrana') {
        // Faza 6 (Wygrana) zatrzymuje grę i odpala film
        uruchomWygrana();
    }
}

/* ===== FAZA 1: LOGIKA STARTOWA ===== */

/**
 * 1b: Wywoływane po kliknięciu koperty
 */
function uruchomGre() {
    // Pokaż modal z filmem, a po zamknięciu uruchom 'startAntywirus'
    pokazModal('video', 'media/haker-wiadomosc.mp4', 'startAntywirus');
}

/**
 * 1c: Wywoływane po zamknięciu filmu
 */
function startAntywirus() {
    // Ukryj intro (tytuł i kopertę)
    document.getElementById('faza-1-intro').classList.add('ukryty');
    // Pokaż ekran ładowania
    document.getElementById('faza-1-ladowanie').classList.remove('ukryty');
    
    // Uruchom animację paska postępu
    animujPasekPostepu();
}

/**
 * 1c: Animuje pasek postępu
 */
function animujPasekPostepu() {
    const pasek = document.getElementById('pasek-postepu-wewn');
    let szerokosc = 0;
    
    const interwalPaska = setInterval(() => {
        if (szerokosc >= 100) {
            clearInterval(interwalPaska);
            // 1d: Pasek pełny, uruchom pisanie tekstu
            uruchomPisanieFazy1();
        } else {
            szerokosc++;
            pasek.style.width = szerokosc + '%';
        }
    }, 20); // Szybkość ładowania paska (w milisekundach)
}

/**
 * 1d: Pokazuje duszka i uruchamia pisanie
 */
function uruchomPisanieFazy1() {
    // Ukryj ładowanie
    document.getElementById('faza-1-ladowanie').classList.add('ukryty');
    // Pokaż kontener z tekstem i duszka
    document.getElementById('faza-1-tekst').classList.remove('ukryty');

    // Uruchom efekt pisania, a po skończeniu pokaż przycisk
    efektPisania('tekst-pisany-1', TEKST_FAZA_1, () => {
        document.getElementById('przycisk-faza-1').classList.remove('ukryty');
    });
}

/* ===== FAZA 2: ZADANIE #1 LOGIKA ===== */

/**
 * 2e: Sprawdza PIN
 */
function sprawdzPin() {
    const pinWpisany = document.getElementById('pin-input').value;
    const wiadomosc = document.getElementById('wiadomosc-faza-2');

    if (pinWpisany === "3285") {
        wiadomosc.textContent = "";
        // Ukryj sekcję z zadaniem
        document.querySelector('#faza-2 .ramka').classList.add('ukryty');
        document.querySelector('#faza-2 .kontener-kodu').classList.add('ukryty');
        document.querySelector('#faza-2 .tytul-zadania').classList.add('ukryty');
        document.querySelector('#faza-2 .podtytul-zadania').classList.add('ukryty');

        // Pokaż sekcję sukcesu
        document.getElementById('faza-2-sukces').classList.remove('ukryty');
        
        // Uruchom pisanie, a po nim pokaż liczbę i przycisk
        efektPisania('tekst-pisany-2', TEKST_FAZA_2, () => {
            document.getElementById('liczba-b4').classList.remove('ukryty');
            document.getElementById('przycisk-faza-2').classList.remove('ukryty');
        });

    } else {
        wiadomosc.textContent = "Zły kod";
    }
}

/* ===== FAZA 3: ZADANIE #2 LOGIKA ===== */

/**
 * 3b/c: Sprawdza hasło
 */
function sprawdzHaslo() {
    let hasloWpisane = document.getElementById('haslo-input').value;
    const wiadomosc = document.getElementById('wiadomosc-faza-3');
    
    // Normalizujemy hasło do wielkich liter
    hasloWpisane = hasloWpisane.toUpperCase();

    const poprawne1 = "SILNE HASLO TO PODSTAWA";
    const poprawne2 = "SILNE HASŁO TO PODSTAWA"; // Z polskim znakiem

    if (hasloWpisane === poprawne1 || hasloWpisane === poprawne2) {
        wiadomosc.textContent = "";
        // Ukryj zadanie
        document.getElementById('faza-3-zadanie').classList.add('ukryty');
        document.querySelector('#faza-3 .tytul-zadania').classList.add('ukryty');
        document.querySelector('#faza-3 .podtytul-zadania').classList.add('ukryty');
        
        // Pokaż sukces
        document.getElementById('faza-3-sukces').classList.remove('ukryty');
    } else {
        wiadomosc.textContent = "Wskazówka: QWERTY";
    }
}

/* ===== FAZA 4: ZADANIE #3 LOGIKA ===== */

/**
 * 4a/b: Pokazuje listę linków po wciśnięciu "DALEJ"
 */
function pokazZadanie3() {
    document.getElementById('faza-4-intro').classList.add('ukryty');
    document.getElementById('faza-4-lista').classList.remove('ukryty');
}

/**
 * 4b/c: Rozpoczyna quiz linków
 */
function rozpocznijQuizLinkow() {
    document.getElementById('faza-4-lista').classList.add('ukryty');
    document.getElementById('faza-4-quiz').classList.remove('ukryty');
    // Pokaż pierwszą część quizu
    pokazCzesciQuizu('linki-czesc-1');
}

/**
 * 4c: Funkcja pomocnicza do pokazywania części quizu
 */
function pokazCzesciQuizu(idCzesci) {
    // Ukryj wszystkie części quizu
    document.querySelectorAll('.quiz-czesc').forEach(czesc => {
        czesc.classList.add('ukryty');
    });
    // Pokaż wybraną część
    document.getElementById(idCzesci).classList.remove('ukryty');
}

/**
 * 4c: Sprawdza odpowiedź w quizie linków
 */
function sprawdzLink(czesc, czyPoprawna) {
    if (czyPoprawna) {
        // Poprawna odpowiedź
        if (czesc === 1) {
            pokazCzesciQuizu('linki-czesc-2');
        } else if (czesc === 2) {
            pokazCzesciQuizu('linki-czesc-3');
        } else if (czesc === 3) {
            pokazCzesciQuizu('linki-czesc-4');
        } else if (czesc === 4) {
            // Ostatnia poprawna - sukces
            document.getElementById('faza-4-quiz').classList.add('ukryty');
            document.getElementById('faza-4-sukces').classList.remove('ukryty');
        }
    } else {
        // Błędna odpowiedź - cofnij do części 1
        pokazCzesciQuizu('linki-czesc-1');
    }
}

/* ===== FAZA 5: ZADANIE #4 LOGIKA ===== */

/**
 * 5a: Wywoływane przy wejściu na fazę 5
 */
function uruchomFilmFazy5() {
    pokazModal('video', 'media/F5-wprowadzenie.mp4', 'pokazZadanie4');
}

/**
 * 5b: Wywoływane po zamknięciu filmu z fazy 5
 */
function pokazZadanie4() {
    document.getElementById('faza-5-zadanie').classList.remove('ukryty');
}

/**
 * 5b: Sprawdza IP
 */
function sprawdzIP() {
    const ip1 = document.getElementById('ip-1').value;
    const ip2 = document.getElementById('ip-2').value;
    const ip3 = document.getElementById('ip-3').value;
    const ip4 = document.getElementById('ip-4').value;
    const wiadomosc = document.getElementById('wiadomosc-faza-5');

    if (ip1 === "17" && ip2 === "88" && ip3 === "55" && ip4 === "18") {
        // Poprawny IP - WYGRANA
        wiadomosc.textContent = "";
        pokazEkran('faza-6-wygrana'); // To wywoła funkcję uruchomWygrana()
    } else {
        wiadomosc.textContent = "Podpowiedź: kolejność alfabetu";
    }
}

/* ===== FAZA 6 i 7: ZAKOŃCZENIE GRY ===== */

/**
 * 6a/b: Wywoływane przy wejściu na ekran wygranej
 */
function uruchomWygrana() {
    if (!czyGraAktywna) return; // Już wygrana/przegrana
    
    czyGraAktywna = false;
    clearInterval(timerInterval); // Zatrzymaj zegar
    document.getElementById('zegar-kontener').classList.add('ukryty');
    
    // Pokaż film końcowy, a po nim treść gratulacji
    pokazModal('video', 'media/F6-zakonczenie.mp4', 'pokazGratulacje');
}

/**
 * 6c: Pokazuje treść gratulacji po filmie
 */
function pokazGratulacje() {
    document.getElementById('faza-6-tresc').classList.remove('ukryty');
}

/**
 * 7: Wywoływane, gdy zegar dojdzie do 0
 */
function przegrana() {
    if (!czyGraAktywna) return; // Gra już się zakończyła (np. wygraną)

    czyGraAktywna = false;
    clearInterval(timerInterval); // Zatrzymaj zegar
    document.getElementById('zegar-kontener').classList.add('ukryty');
    
    // Pokaż ekran przegranej
    pokazEkran('faza-7-przegrana');
}

/**
 * 7: Resetuje grę (przeładowuje stronę)
 */
function resetGry() {
    location.reload();
}

/* ===== SYSTEM ZEGARA ===== */

function startTimera() {
    czyGraAktywna = true;
    document.getElementById('zegar-kontener').style.display = 'block';
    
    // Uruchom interwał, który co sekundę aktualizuje zegar
    timerInterval = setInterval(aktualizujTimer, 1000);
}

function aktualizujTimer() {
    if (!czyGraAktywna) return;

    czasPozostaly--; // Odejmij sekundę

    if (czasPozostaly <= 0) {
        // Czas się skończył
        document.getElementById('zegar').textContent = "00:00";
        przegrana(); // Uruchom ekran przegranej
    } else {
        // Aktualizuj wyświetlanie zegara
        const minuty = Math.floor(czasPozostaly / 60);
        const sekundy = czasPozostaly % 60;
        
        // Formatowanie (aby było 09:05 zamiast 9:5)
        const sformatowaneMinuty = minuty.toString().padStart(2, '0');
        const sformatowaneSekundy = sekundy.toString().padStart(2, '0');
        
        document.getElementById('zegar').textContent = `${sformatowaneMinuty}:${sformatowaneSekundy}`;
    }
}

/* ===== SYSTEM MODALI (POPUPS) ===== */

/**
 * Pokazuje modal z treścią (video, image, audio)
 * @param {'image' | 'video' | 'audio'} typ Treść do pokazania
 * @param {string} src Ścieżka do pliku w folderze /media/
 * @param {string | null} nazwaFunkcjiCallback Nazwa funkcji do wywołania po zamknięciu
 */
function pokazModal(typ, src, nazwaFunkcjiCallback = null) {
    const overlay = document.getElementById('modal-overlay');
    const contentDiv = document.getElementById('modal-dynamic-content');
    
    // Zapisz callback
    if (nazwaFunkcjiCallback) {
        modalCallback = nazwaFunkcjiCallback;
    }

    // Wyczyść starą zawartość
    contentDiv.innerHTML = "";
    let element;

    // Stwórz odpowiedni element
    if (typ === 'video') {
        element = document.createElement('video');
        element.src = src;
        element.controls = true; // Pokaż kontrolki
        element.autoplay = true; // Odtwórz automatycznie
    } else if (typ === 'image') {
        element = document.createElement('img');
        element.src = src;
    } else if (typ === 'audio') {
        element = document.createElement('audio');
        element.src = src;
        element.controls = true;
        element.autoplay = true;
    }

    if (element) {
        contentDiv.appendChild(element);
    }
    
    // Pokaż modal
    overlay.classList.remove('ukryty');
    overlay.classList.add('aktywny');
}

/**
 * Zamyka modal i wywołuje callback, jeśli istnieje
 */
function zamknijModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('ukryty');
    overlay.classList.remove('aktywny');

    // Zatrzymaj media (ważne dla wideo i audio)
    const contentDiv = document.getElementById('modal-dynamic-content');
    const mediaElement = contentDiv.querySelector('video, audio');
    if (mediaElement) {
        mediaElement.pause();
        mediaElement.src = ""; // Przerywa ładowanie
    }
    contentDiv.innerHTML = ""; // Czyści zawartość

    // Wywołaj zapisaną funkcję (jeśli istnieje)
    if (modalCallback) {
        // Używamy window[nazwaFunkcji], aby wywołać funkcję globalną o podanej nazwie
        if (typeof window[modalCallback] === 'function') {
            window[modalCallback]();
        }
        modalCallback = null; // Wyczyść callback po użyciu
    }
}

/* ===== SYSTEM EFEKTU PISANIA (TYPEWRITER) ===== */

/**
 * Wyświetla tekst litera po literze w danym elemencie.
 * @param {string} elementId ID elementu <p>, gdzie ma się pojawić tekst
 * @param {string} tekst Pełny tekst do napisania
 * @param {function | null} funkcjaPoSkonczeniu Funkcja do wywołania po zakończeniu pisania
 */
function efektPisania(elementId, tekst, funkcjaPoSkonczeniu = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let i = 0;
    element.innerHTML = ""; // Wyczyść element

    function pisz() {
        if (i < tekst.length) {
            element.innerHTML += tekst.charAt(i);
            i++;
            setTimeout(pisz, 30); // Szybkość pisania (w milisekundach)
        } else if (funkcjaPoSkonczeniu) {
            // Pisanie skończone, wywołaj funkcję zwrotną
            funkcjaPoSkonczeniu();
        }
    }
    pisz(); // Rozpocznij pisanie
}