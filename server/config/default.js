// -*- mode: javascript; coding: utf-8 -*-
module.exports = {
  "db": {
    "database": "spils",
    "connectionLimit": 5,
    "connectTimeout": 10000, // 10 seconds
    "waitForConnections": true,
    "queueLimit": 10,
    "timezone": "Z"
  },

  "auth": {
  },

  "server": {
  },

  "jwt": {
    "secret": "SECRET",
    "algorithms": ["HS256"]
  },

  "sycamore-auth": {
    "school-id": "2132",
    "url": "https://app.sycamoreschool.com/index.php",
    "success-text": "schoolhome.php"
  },

  "smtp": {
    "host": "",
    "port": 587,
    "user": "noreply@gssb.org",
    "password": "",
    "fake": true,
  },

  "logging": {
    "level": "debug",
  },

  "email": {
    "sender": "GSSB Library <school@gssb.org>",
    "subject": "German Saturday School Library Status",
    "reply_to": "library-reminder@gssb.org",
    "test_recipients": []
  },

  "items": {
    "categories": [
      "Buch",
      "CD",
      "DVD",
      "Comic",
      "Multimedia",
      "Zeitschrift"
    ],
    "subjects": [
      "Bilderbuch B - gelb",
      "CD",
      "Comic C - orange",
      "DVD",
      "Erzaehlung E - dunkelgruen",
      "Fasching",
      "Halloween",
      "Klassik",
      "Leseleiter LL - klar",
      "Maerchen Mae - rot",
      "Multimedia MM - rosa",
      "Musik",
      "Ostern",
      "Sachkunde S - blau",
      "Sachkunde Serie - hellblau",
      "St. Martin",
      "Teen T - hellgruen",
      "Uebergroesse - lila",
      "Weihnachten",
      "Zeitschrift",
    ],
    "ages": [
      "All Ages",
      "K-1",
      "K-2",
      "T-12",
      "T-17",
      "Leseleiter-1A",
      "Leseleiter-1B",
      "Leseleiter-1C",
      "Leseleiter-2",
      "Leseleiter-3",
      "Leseleiter-4",
      "Leseleiter-5",
      "Leseleiter-6",
      "Leseleiter-7",
      "Leseleiter-8",
      "Leseleiter-9",
      "Leseleiter-10",
    ]
  },

  "checkout": {
    borrowDays: 29,
    renewalDays: 29,
    renewalLimitDays: 15,
  },

  "fonts": {
    "Times": {
      path: __dirname + '/../fonts/times.ttf',
      fallback: true
    },
    "Times-Bold": {
      path: __dirname + '/../fonts/timesbd.ttf',
    },
    "Times-Italic": {
      path: __dirname + '/../fonts/timesi.ttf',
    },
    "Times-Bold-Italic": {
      path: __dirname + '/../fonts/timesbi.ttf',
    },
  },

  "labels": [

    {
      name: "Main: Leseleiter",
      category: "main",
      type: "w79h252",
      isApplicable: item => item.age.startsWith('Leseleiter-'),
      prepare: (item, params={}) => {
        return {age: item.age.split('-')[1]};
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-leseleiter.pdf',
        schemas: [{
          age: {
            type: 'text',
            position: { x: 26.5, y: 2.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times',
            fontSize: 16
          },
        }]
      }
    },

    {
      name: "Main: Sachkunde",
      category: "main",
      type: "w79h252",
      isApplicable: item => item.subject.startsWith('Sachkunde'),
      prepare: (item, params={}) => {
        const classifications = {
          'B': ['Biographie', ''],
          'Ba': ['Basteln /', 'Handarbeit'],
          'Be': ['Beschäftigung /', 'Spielen'],
          'Ber': ['Berufe', ''],
          'De': ['Deutsche', 'Geschichte'],
          'Es': ['Essen /', 'Kochen'],
          'G': ['Geschichte /', 'Kulturen'],
          'Geo': ['Geographie /', 'Atlanten'],
          'Kl': ['Klassik', ''],
          'Kö': ['Körper', ''],
          'Ku': ['Kunst /', 'Architektur'],
          'Le': ['Lernen /', 'Lexikon'],
          'M': ['Musik /', 'Liederbuch'],
          'N': ['Natur / Umwelt /', 'Jahreszeiten'],
          'R': ['Religion', ''],
          'Sp': ['Sport', ''],
          'Te': ['Technik', ''],
          'Ti': ['Tiere', ''],
          'Ve': ['Verkehr /', 'Fahrzeuge'],
          'Wir': ['Wirtschaft', ''],
          'Wo': ['Wohnen', ''],
        };
        let abbr = item.classification.split(' ')[0];
        if (classifications[abbr] === undefined) {
          return {
            cls_abbr: abbr,
            cls1: '',
            cls2: '',
          };
        }
        return {
          cls_abbr: abbr,
          cls1: classifications[abbr][0],
          cls2: classifications[abbr][1],
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-sachkunde.pdf',
        schemas: [{
          cls_abbr: {
            type: 'text',
            position: { x: 26.5, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 14
          },
          cls1: {
            type: 'text',
            position: { x: 51.55, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
          cls2: {
            type: 'text',
            position: { x: 51.55, y: 1 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Main: Erzählung",
      category: "main",
      type: "w79h252",
      isApplicable: item => item.subject.startsWith('Erzaehlung'),
      prepare: (item, params={}) => {
        let big = item.classification.startsWith('E/G');
        let author_abbr = item.classification;
        // Deal with messed up data.
        if (big || ['Erzaehlung', 'Erzaehlungen', 'Erzählung'].includes(item.classification)) {
          author_abbr = item.author.substring(0, 3);
        }
        return {
          author_abbr: author_abbr,
          subj_abbr:  big ? 'E/G' : 'E',
          subj_prefix: big ? 'Erzählung/' : '',
          marker: big ? 'groß' : 'Erzählung',
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-erzaehlung.pdf',
        schemas: [{
          author_abbr: {
            type: 'text',
            position: { x: 26.5, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times',
            fontSize: 12
          },
          subj_abbr: {
            type: 'text',
            position: { x: 26.5, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times',
            fontSize: 12
          },
          subj_prefix: {
            type: 'text',
            position: { x: 51.55, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times',
            fontSize: 12
          },
          marker: {
            type: 'text',
            position: { x: 51.55, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Main: Comic",
      category: "main",
      type: "w79h252",
      isApplicable: item => item.subject.startsWith('Comic'),
      prepare: (item, params={}) => {
        let sub_cat = item.classification
        if (
          (sub_cat.startsWith('Comic') || sub_cat.startsWith('Serie'))
            && item.seriestitle
        ) {
          sub_cat = item.seriestitle
        }
        if (sub_cat === 'na') {
          sub_cat = '';
        }
        return {
          sub_cat_abbr:  sub_cat.substring(0, 3),
          sub_cat: sub_cat,
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-comic.pdf',
        schemas: [{
          sub_cat_abbr: {
            type: 'text',
            position: { x: 26.5, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times',
            fontSize: 12
          },
          marker: {
            type: 'text',
            position: { x: 51.55, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Main: Zeitschrift",
      category: "main",
      type: "w79h252",
      isApplicable: item => item.subject.startsWith('Zeitschrift'),
      prepare: (item, params={}) => {
        return {};
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-zeitschrift.pdf',
        schemas: [],
      }
    },

    {
      name: "Main: Holiday",
      category: "main",
      type: "w79h252",
      isApplicable: item => {
        return [
          'Fasching',
          'Halloween',
          'Ostern',
          'St. Martin',
          'Weihnachten',
        ].includes(item.subject);
      },
      prepare: (item, params={}) => {
        return {
          'holiday': item.subject,
          'holiday_initial': item.subject[0],
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-holiday.pdf',
        schemas: [{
          holiday: {
            type: 'text',
            position: { x: 26.5, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 12
          },
          holiday_abbr: {
            type: 'text',
            position: { x: 51.55, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
        }],
      }
    },

    {
      name: "Main: Bilderbuch With Author",
      category: "main",
      type: "w79h252",
      isApplicable: item => (item.classification && item.classification.startsWith('B/')),
      prepare: (item, params={}) => {
        /* Sometimes the author or category is listed as part of the
           classification */
        let parts = item.classification.split(' ', 1)
        let classification = parts[0];
        let author = item.author.split(',')[0];
        let author_abbr = '';

        if (parts.length == 1) {
          author_abbr = author.substring(0, 3);
        } else {
          let author = None;
          author_abbr = parts[1];

          // Special and crappy case.
          if (author_abbr == 'Bilderbuch klein Autor') {
            /* It turns out that if the book is a series, we use it
               as the author value! WTF?! */
            let author = item.seriestitle;
            if (author == 'na') {
              author = self.item.author.split(',')[0]
              author_abbr = author.substring(0, 3);
            } else {
              /* It turns out that if the book is a series, we use it
                 as the author value! WTF?!
                 Sometimes it is just a substring too: Mau -> Die Maus */
              if (self.item.seriestitle.includes(author_abbr)) {
                author = item.seriestitle;
              } else {
                author = item.author.split(',')[0];
              }
            }
          }
        }

        const classificationToSize = {
          'B/K': 'klein',
          'B/M': 'mittel',
          'B/G': 'groß',
        };
        cls_abbr = item.classification.substring(0, 3);
        return {
          author_abbr: author_abbr.toUpperCase(),
          classification: classification,
          size: classificationToSize[cls_abbr],
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-bilderbuch-with-author.pdf',
        schemas: [{
          author_abbr: {
            type: 'text',
            position: { x: 26.5, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 14
          },
          classification: {
            type: 'text',
            position: { x: 26.5, y: 7.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 14
          },
          size: {
            type: 'text',
            position: { x: 46.55, y: 7.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Main: Bilderbuch With Topic",
      category: "main",
      type: "w79h252",
      isApplicable: item => {
        if (!item.subject.startsWith('Bilderbuch')) {
          return false;
        }
        if (!item.classification) {
          return false;
        }
        let lower_cls = item.classification.toLowerCase();
        for (let topic of ['bau', 'fam', 'far', 'nat', 'sch', 'ti', 've', 'za', 'ze']) {
          if (lower_cls.startsWith(topic)) {
            return true;
          }
        }
        return false;
      },
      prepare: (item, params={}) => {
        const topics = {
          'bau': 'Bauernhof',
          'fam': 'Familie',
          'far': 'Farben',
          'nat': 'Natur',
          'sch': 'Schule',
          'ti': 'Tiere',
          've': 'Verkehr',
          'za': 'Zahlen',
          'ze': 'Zeit',
        };
        let lower_cls = item.classification.toLowerCase();
        let topic_abbr = '';
        let topic = '';
        for ([topic_abbr, topic] of Object.entries(topics)) {
          if (lower_cls.startsWith(topic)) {
            break;
          }
        }
        return {
          topic_abbr: topic_abbr.substring(0, 1).toUpperCase() + topic_abbr.substring(1),
          topic: topic
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-bilderbuch-with-topic.pdf',
        schemas: [{
          topic_abbr: {
            type: 'text',
            position: { x: 26.5, y: 4.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 14
          },
          topic: {
            type: 'text',
            position: { x: 51.55, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Main: Boardbook",
      category: "main",
      type: "w79h252",
      isApplicable: item => (item.classification && item.classification.startsWith('Bb')),
      prepare: (item, params={}) => {
        return {};
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-boardbook.pdf',
        schemas: [],
      }
    },

    {
      name: "Main: DVD",
      category: "main",
      type: "w79h252",
      params: [
        {
          key: 'title_abbr',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: 'Title Abbreviations',
            placeholder: 'Title Abbreviations',
            required: false,
          }
        },
      ],
      isApplicable: item => (item.category === 'DVD'),
      prepare: (item, params={}) => {
        let title_abbr = params.title_abbr;
        if (title_abbr === undefined) {
          title = item.title.toUpperCase();
          for (let word of ['der', 'die', 'das']) {
            if (title.startsWith(word.toUpperCase()+' ')) {
              title = title.substring(word.length+1);
            }
          }
          title_abbr = title.substring(0, 3);
        }
        var add_on = '';
        var classification = item.classification;
        if (item.classification == 'Teenager') {
          add_on = 'Teenager';
          classification = 'T12';
        }
        if (item.classification == 'Erwachsene') {
          add_on = 'Erwachsene';
          classification = 'T17';
        }
        if (item.classification == 'Klassiker') {
          add_on = 'Klassiker';
          classification = 'KL';
        }
        if (item.classification == 'Sachkunde') {
          add_on = 'Sachkunde';
          classification = 'S';
        }
        return {
          title_abbr: title_abbr,
          classification: classification,
          add_on: add_on,
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/main-dvd.pdf',
        schemas: [{
          title_abbr: {
            type: 'text',
            position: { x: 26.5, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times',
            fontSize: 12
          },
          classification: {
            type: 'text',
            position: { x: 26.5, y: 6.65 },
            width: 35,
            height: 7,
            alignment: "center",
            fontName: 'Times-Bold',
            fontSize: 12
          },
          add_on: {
            type: 'text',
            position: { x: 51.55, y: 1.65 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times-Italic',
            fontSize: 12
          },
        }]
      }
    },

    {
      name: "Barcode",
      category: "barcode",
      type: "TZc-241",
      isApplicable: item => true,
      prepare: (item, params={}) => {
        return {
          barcode: item.barcode,
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/barcode.pdf',
        schemas: [{
          barcode: {
            type: 'code39',
            position: { x: 3, y: 7 },
            width: 57.0,
            height: 9.5,
          },
        }],
      }
    },

    {
      name: "Property",
      category: "property",
      type: "w79h252",
      isApplicable: item => true,
      params: [
        {
          key: 'year',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: 'School Year Acquired',
            placeholder: 'School Year Acquired',
            required: false,
          }
        },
        {
          key: 'include_price',
          type: 'checkbox',
          defaultValue: true,
          templateOptions: {
            label: 'Include Replacement Price',
            placeholder: 'Include Replacement Price',
            required: false,
          }
        },
      ],
      prepare: (item, params={}) => {
        price = item.replacementprice.toLocaleString(
          'en-US', {style: 'currency', currency: 'USD'});
        return {
          year: params.year !== undefined ? params.year : '',
          price: params.include_price || params.include_price === undefined
            ? `Wert ${price}` : ''
        };
      },
      template: {
        basePdf: __dirname + '/../label-templates/property.pdf',
        schemas: [{
          year: {
            type: 'text',
            position: { x: 10, y: 18 },
            width: 35,
            height: 7,
            alignment: "left",
            fontName: 'Times',
            fontSize: 12
          },
          price: {
            type: 'text',
            position: { x: 47.3, y: 18 },
            width: 35,
            height: 7,
            alignment: "right",
            fontName: 'Times',
            fontSize: 12
          },
        }],
      }
    },


    {
      name: "Copyright",
      category: "copyright",
      type: "w79h252",
      isApplicable: item => true,
      prepare: (item, params={}) => {
        return {};
      },
      template: {
        basePdf: __dirname + '/../label-templates/copyright.pdf',
        schemas: [],
      }
    },

  ]
};
