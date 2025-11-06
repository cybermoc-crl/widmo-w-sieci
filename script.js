/* ===== POBIERANIE ELEMENTÓW AUDIO ===== */
const muzykaTla = document.getElementById('muzyka-tla');
const sfxPisaniePetla = document.getElementById('sfx-pisanie-petla');
const sfxPoprawny = document.getElementById('sfx-poprawny');
const sfxBledny = document.getElementById('sfx-bledny');
const sfxWygrana = document.getElementById('sfx-wygrana');
const sfxPrzegrana = document.getElementById('sfx-przegrana');
const duszekGif = document.getElementById('duszek-gif');
/**
 * Pomocnicza funkcja do odtwarzania dźwięków (z resetowaniem)
 * @param {HTMLAudioElement} elementAudio 
 */
function odtworzDzwiek(elementAudio) {
    if (elementAudio) {
        elementAudio.currentTime = 0; // Resetuje dźwięk, aby mógł grać szybko po sobie
        elementAudio.play();
    }
}

/* ===== ZMIENNE GLOBALNE ===== */
let timerInterval = null; // Przechowuje nasz interwał zegara
let czasPozostaly = 20 * 60; // 20 minut * 60 sekund
let czyGraAktywna = false; // Zapobiega podwójnemu zakończeniu gry
let modalCallback = null; // Funkcja do wywołania po zamknięciu modala
let pinBledneProby = 0;
let hasloBledneProby = 0;
let ipBledneProby = 0;

// Teksty do animacji pisania (możesz je dowolnie zmieniać)
// Użyj `\n` aby zrobić nową linię
const TEKST_FAZA_1 = "Cześć! Jestem Safira, Twój inteligentny antywirus! Przez otworzenie szkodliwego linku, haker otrzymał dostęp do wszystkich Twoich plików. Na szczęście dzięki swojej wiadomości zostawił zaszyfrowany cyfrowy ślad, który pomoże policji w jego ujęciu. Abym mogła go odczytać, podążaj jego tropem, wykonując szereg moich zadań. Po ukończeniu każdego z nich, ujawnią się fragmenty jego numeru IP. Zapamiętaj je, to bardzo istotne! Powodzenia!";
const TEKST_FAZA_2 = "Brawo! Udało ci się odzyskać część plików. Hmm... Wygląda na to, że ten haker to prawdziwe widmo i umie zacierać ślady. Przez to moje oprogramowanie nie jest w stanie odczytać niezbędnych numerów. Opracowałam jednak coś, co ci na pewno się przyda! Użyj mojego zestawu szyfrów aby wykonać następne zadanie i ustawić dwuetapową weryfikację. Poniżej podaję fragment śladu hakera:\n  \n  ";
const TEKST_FAZA_3 = "Łamanie szyfrów to dla Ciebie pestka :) Dzięki temu jesteś już w połowie naszej misji! O nie!... Haker chyba się zorientował, że próbujemy pokrzyżować jego plany! Nie będę mogła Ci już dalej pomagać. Na szczęście zdążyłam zapisać Ci kolejny ślad na stronie, do której podam Ci link. Przez wirusa nie będzie to jednak takie proste. Przejdź przez sieć URL zapamiętując dobrą kolejność. Uważaj jednak na szkodliwe linki- nie zawsze wyglądają podejrzanie...";

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
    // Start muzyki w tle (Punkt 1)
    if (muzykaTla && muzykaTla.paused) {
        muzykaTla.volume = 0.3; // Możesz ustawić głośność (0.0 do 1.0)
        muzykaTla.play();
    }

    // Pokaż modal z filmem, a po zamknięciu uruchom 'startAntywirus'
    pokazModal('video', 'media/aw.mp4', 'startAntywirus');
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
    const przyciskWskazowki = document.getElementById('przycisk-wskazowka-faza2');

    if (pinWpisany === "3285") {
        odtworzDzwiek(sfxPoprawny);
        wiadomosc.textContent = "";
        pinBledneProby = 0; // Resetuj licznik po sukcesie

        if (przyciskWskazowki) {
            przyciskWskazowki.classList.add('ukryty'); // Ukryj wskazówkę po sukcesie
        }

        // Ukrywanie elementów zadania
        document.querySelector('#faza-2 .ramka').classList.add('ukryty');
        document.querySelector('#faza-2 .kontener-kodu').classList.add('ukryty');
        document.querySelector('#faza-2 .tytul-zadania').classList.add('ukryty');
        document.querySelector('#faza-2 .podtytul-zadania').classList.add('ukryty');

        // Pokazywanie ekranu sukcesu
        document.getElementById('faza-2-sukces').classList.remove('ukryty');
        efektPisania('tekst-pisany-2', TEKST_FAZA_2, () => {
            document.getElementById('liczba-b4').classList.remove('ukryty');
            document.getElementById('przycisk-faza-2').classList.remove('ukryty');
        });

    } else {
        // Jeśli kod jest ZŁY
        odtworzDzwiek(sfxBledny);
        wiadomosc.textContent = "Zły kod";

        // === NOWA LOGIKA WSKAZÓWKI ===
        pinBledneProby++; // Zwiększ licznik błędów

        if (pinBledneProby >= 2) {
            // Pokaż przycisk wskazówki po 2 błędach
            if (przyciskWskazowki) {
                przyciskWskazowki.classList.remove('ukryty');
            }
        }
        // ============================
    }
}

/* ===== FAZA 3: ZADANIE #2 LOGIKA ===== */

/**
 * 3b/c: Sprawdza hasło (Wersja z nowymi hasłami + logiką wskazówki)
 */
function sprawdzHaslo() {
    const wiadomosc = document.getElementById('wiadomosc-faza-3');
    const przyciskWskazowki = document.getElementById('przycisk-wskazowka-faza3');
    
    // Używamy .trim(), aby automatycznie usunąć spacje z początku i końca
    let hasloWpisane = document.getElementById('haslo-input').value.toUpperCase().trim(); 
    
    // Dzięki .trim(), musimy sprawdzać już tylko dwie główne wersje
    const poprawne1 = "SILNE HASLO TO PODSTAWA";
    const poprawne2 = "SILNE HASŁO TO PODSTAWA";

    if (hasloWpisane === poprawne1 || hasloWpisane === poprawne2) {
        // Jeśli hasło jest POPRAWNE
        odtworzDzwiek(sfxPoprawny);
        wiadomosc.textContent = "";
        hasloBledneProby = 0; // Resetuj licznik błędów

        if (przyciskWskazowki) {
            przyciskWskazowki.classList.add('ukryty'); // Ukryj wskazówkę po sukcesie
        }

        // Ukrywanie zadania
        document.getElementById('faza-3-zadanie').classList.add('ukryty');
        document.querySelector('#faza-3 .tytul-zadania').classList.add('ukryty');
        document.querySelector('#faza-3 .podtytul-zadania').classList.add('ukryty');
        
        // Pokazywanie sukcesu
        document.getElementById('faza-3-sukces').classList.remove('ukryty');
    
    } else {
        // Jeśli hasło jest BŁĘDNE
        odtworzDzwiek(sfxBledny);
        wiadomosc.textContent = "Wskazówka: szyfr znajduje się na plakacie";
        
        // Logika licznika wskazówki
        hasloBledneProby++; // Zwiększ licznik błędów
        
        if (hasloBledneProby >= 3) {
            // Pokaż przycisk wskazówki po 3 błędach
            if (przyciskWskazowki) {
                przyciskWskazowki.classList.remove('ukryty');
            }
        }
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
    pokazModal('video', 'media/aw2.mp4', 'pokazZadanie4');
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
    const przyciskWskazowki = document.getElementById('przycisk-wskazowka-faza5');

    if (ip1 === "17" && ip2 === "88" && ip3 === "55" && ip4 === "18") {
        // Jeśli IP jest POPRAWNE
        odtworzDzwiek(sfxPoprawny);
        wiadomosc.textContent = "";
        ipBledneProby = 0; // Resetuj licznik błędów

        if (przyciskWskazowki) {
            przyciskWskazowki.classList.add('ukryty'); // Ukryj wskazówkę po sukcesie
        }

        pokazEkran('faza-6-wygrana'); // To wywoła funkcję uruchomWygrana()

    } else {
        // Jeśli IP jest BŁĘDNE
        odtworzDzwiek(sfxBledny);
        wiadomosc.textContent = "Podpowiedź: kolejność alfabetu";

        // === NOWA LOGIKA WSKAZÓWKI ===
        ipBledneProby++; // Zwiększ licznik błędów

        if (ipBledneProby >= 3) {
            // Pokaż przycisk wskazówki po 3 błędach
            if (przyciskWskazowki) {
                przyciskWskazowki.classList.remove('ukryty');
            }
        }
        // ============================
    }
}

/* ===== FAZA 6 i 7: ZAKOŃCZENIE GRY ===== */

/**
 * 6a/b: Wywoływane przy wejściu na ekran wygranej
 */
function uruchomWygrana() {
    if (!czyGraAktywna) return; 

    czyGraAktywna = false;
    clearInterval(timerInterval); 
    document.getElementById('zegar-kontener').classList.add('ukryty');

    // (Punkt 4: Dźwięk wygranej)
    muzykaTla.pause(); // Zatrzymujemy muzykę w tle
    odtworzDzwiek(sfxWygrana); // Odtwarzamy dźwięk wygranej

    document.getElementById('faza-6-tresc').classList.remove('ukryty');
}

/**
 * 7: Wywoływane, gdy zegar dojdzie do 0
 */
function przegrana() {
    if (!czyGraAktywna) return; 

    czyGraAktywna = false;
    clearInterval(timerInterval); 
    document.getElementById('zegar-kontener').classList.add('ukryty');

    // (Punkt 5: Dźwięk przegranej)
    muzykaTla.pause(); // Zatrzymujemy muzykę w tle
    odtworzDzwiek(sfxPrzegrana); // Odtwarzamy dźwięk przegranej

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

    // === NOWY KOD: POKAŻ DUSZKA ===
    if (duszekGif) {
        duszekGif.classList.remove('ukryty');
    }
    // ================================

    // STARTUJEMY PĘTLĘ DŹWIĘKOWĄ PISANIA
    if (sfxPisaniePetla) {
        sfxPisaniePetla.currentTime = 0;
        sfxPisaniePetla.play();
    }

    function pisz() {
        if (i < tekst.length) {
            // Ta część jest bez zmian
            const znak = tekst.charAt(i);
            element.innerHTML += znak;

            i++;
            setTimeout(pisz, 30); // Szybkość pisania (w milisekundach)

        } else {
            // Pisanie skończone

            // === NOWY KOD: UKRYJ DUSZKA ===
            if (duszekGif) {
                duszekGif.classList.add('ukryty');
            }
            // ==============================

            // ZATRZYMUJEMY PĘTLĘ DŹWIĘKOWĄ PISANIA
            if (sfxPisaniePetla) {
                sfxPisaniePetla.pause();
            }

            // Wywołaj funkcję zwrotną (jeśli istnieje)
            if (funkcjaPoSkonczeniu) {
                funkcjaPoSkonczeniu();
            }
        }
    }
    pisz(); // Rozpocznij pisanie

}






