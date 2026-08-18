// Curated Custom 3D Gifts Catalog for D Loop 3D
const CUSTOM_GIFTS_CATALOG = [
  {
    "id": "gift-dual-name-plank",
    "name": "Dual Name Optical Illusion Plank (Flipname)",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 599,
    "originalPrice": 899,
    "rating": 4.9,
    "reviews": 142,
    "badge": "BESTSELLER",
    "img": "assets/gifts/dual-name-plank_1.jpg",
    "gallery": [
      "assets/gifts/dual-name-plank_1.jpg",
      "assets/gifts/dual-name-plank_2.png",
      "assets/gifts/dual-name-plank_3.png"
    ],
    "description": "🔤 Max 10 letters per name\n\nWe can do it for any two names!!! HOW?\nLet us take these two names for example:\n\nAISHU [5 letters] & RAM [3 letters] - The colour ordered is BLUE\n\nWe will add two BLUE hearts to match the number of letters in both the names.\nONLY ONE RED HEART IS PRESENT IF SELECTED",
    "customizationFields": [
      {
        "id": "color",
        "label": "STEP 1 - Colour",
        "type": "pills",
        "options": [
          "BLUE",
          "GOLD",
          "PURPLE",
          "YELLOW",
          "BABY PINK",
          "WHITE",
          "BLACK",
          "SKY BLUE",
          "RED",
          "GREEN"
        ],
        "default": "BLUE",
        "required": true
      },
      {
        "id": "red_heart",
        "label": "STEP 2 - Red Heart Option",
        "type": "pills",
        "options": [
          "0 RED HEART",
          "1 RED HEART (+ Rs. 30.00)",
          "2 RED HEART (+ Rs. 50.00)"
        ],
        "default": "0 RED HEART",
        "required": true
      },
      {
        "id": "section_names",
        "label": "✨ ENTER the NAMES for your PLANK",
        "type": "section_header"
      },
      {
        "id": "name1",
        "label": "STEP 4 - First Name on Plank *",
        "type": "text",
        "placeholder": "Name that will be seen from the LEFT",
        "maxlength": 10,
        "subtitle": "0/10 characters",
        "required": true
      },
      {
        "id": "name2",
        "label": "STEP 5 - Second Name on Plank *",
        "type": "text",
        "placeholder": "Name that will be seen from the RIGHT",
        "maxlength": 10,
        "subtitle": "0/10 characters",
        "required": true
      },
      {
        "id": "whatsapp",
        "label": "STEP 6 - Whatsapp Number to send DEMO Video",
        "type": "text",
        "placeholder": "Enter the WHATSAPP Number",
        "required": false
      }
    ]
  },
  {
    "id": "gift-dual-name-plank-lightbox",
    "name": "Dual Name Plank with Wooden Base Stand",
    "category": "showpiece",
    "categoryLabel": "✨ 3D Sculptures & Desk Decor",
    "price": 999,
    "originalPrice": 1499,
    "rating": 5.0,
    "reviews": 189,
    "badge": "TOP RATED",
    "img": "assets/gifts/dual-name-plank-with-light-box_1.jpg",
    "gallery": [
      "assets/gifts/dual-name-plank-with-light-box_1.jpg",
      "assets/gifts/dual-name-plank-with-light-box_2.png",
      "assets/gifts/dual-name-plank-with-light-box_3.png"
    ],
    "description": "Our iconic Dual Name sculpture mounted on an authentic solid wooden base with crafted on a solid wooden stand.",
    "customizationFields": [
      {
        "id": "name1",
        "label": "First Name (Left Side) *",
        "type": "text",
        "placeholder": "e.g. Karthik",
        "required": true
      },
      {
        "id": "name2",
        "label": "Second Name (Right Side) *",
        "type": "text",
        "placeholder": "e.g. Sneha",
        "required": true
      },
      {
        "id": "baseText",
        "label": "Engraved Wooden Base Text",
        "type": "text",
        "placeholder": "e.g. Happy 1st Anniversary ❤️",
        "required": false
      }
    ]
  },
  {
    "id": "gift-soulmate-combo-with-light",
    "name": "Soulmate Supreme Combo (Plank + Rose + Magnet Keychains)",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 1499,
    "originalPrice": 2299,
    "rating": 5.0,
    "reviews": 240,
    "badge": "MEGA COMBO",
    "img": "assets/gifts/soulmate-combo-with-light_1.jpg",
    "gallery": [
      "assets/gifts/soulmate-combo-with-light_1.jpg",
      "assets/gifts/soulmate-combo-with-light_2.png",
      "assets/gifts/soulmate-combo-with-light_3.jpg"
    ],
    "description": "The ultimate romantic gift bundle! Includes (1) Dual Name Plank with Wooden Stand, (2) 3D Eternal Rose with Personalized Name Stem, and (3) Magnetic Heart Keychain Duo.",
    "customizationFields": [
      {
        "id": "name1",
        "label": "Partner 1 Name *",
        "type": "text",
        "placeholder": "e.g. Vicky",
        "required": true
      },
      {
        "id": "name2",
        "label": "Partner 2 Name *",
        "type": "text",
        "placeholder": "e.g. Pooja",
        "required": true
      },
      {
        "id": "roseName",
        "label": "Name on Rose Stem *",
        "type": "text",
        "placeholder": "e.g. My Pooja",
        "required": true
      },
      {
        "id": "specialDate",
        "label": "Date Inscription",
        "type": "text",
        "placeholder": "e.g. 24.11.2023",
        "required": false
      },
      {
        "id": "giftWrap",
        "label": "Luxury Gift Box & Greeting Card",
        "type": "select",
        "options": [
          "Premium Velvet Box + Handmade Card (+₹150)",
          "Standard Studio Box (₹0)"
        ],
        "default": "Premium Velvet Box + Handmade Card (+₹150)"
      }
    ]
  },
  {
    "id": "gift-duosnap",
    "name": "DUOSNAP – Dual Photo Lithophane Frame",
    "category": "lithophane",
    "categoryLabel": "📸 3D Photo Lithophanes",
    "price": 699,
    "originalPrice": 1099,
    "rating": 4.9,
    "reviews": 115,
    "badge": "TRENDING",
    "img": "assets/gifts/duosnap_1.jpg",
    "gallery": [
      "assets/gifts/duosnap_1.jpg",
      "assets/gifts/duosnap_2.jpg",
      "assets/gifts/duosnap_3.jpg"
    ],
    "description": "High-definition 3D textured lithophane panel displaying your favorite photos. When backlit with light, it reveals stunning photographic realism!",
    "customizationFields": [
      {
        "id": "photo1",
        "label": "Upload Main Photo *",
        "type": "file",
        "required": true
      },
      {
        "id": "customText",
        "label": "Custom Caption / Names",
        "type": "text",
        "placeholder": "e.g. Forever & Always",
        "required": false
      }
    ]
  },
  {
    "id": "gift-dual-name-photo-frame",
    "name": "Dual Name 3D Rotating Photo Frame",
    "category": "lithophane",
    "categoryLabel": "📸 3D Photo Lithophanes",
    "price": 899,
    "originalPrice": 1299,
    "rating": 4.9,
    "reviews": 98,
    "badge": "UNIQUE",
    "img": "assets/gifts/dual-name-photo-frame_1.jpg",
    "gallery": [
      "assets/gifts/dual-name-photo-frame_1.jpg",
      "assets/gifts/dual-name-photo-frame_2.jpg",
      "assets/gifts/dual-name-photo-frame_3.jpg"
    ],
    "description": "Rotating desk frame with couple names sculpted into the rotating axis and slots for two high-res photos on opposite sides.",
    "customizationFields": [
      {
        "id": "name1",
        "label": "Name 1 (Left) *",
        "type": "text",
        "placeholder": "e.g. Arjun",
        "required": true
      },
      {
        "id": "name2",
        "label": "Name 2 (Right) *",
        "type": "text",
        "placeholder": "e.g. Deepa",
        "required": true
      },
      {
        "id": "photo1",
        "label": "Upload Photo 1 *",
        "type": "file",
        "required": true
      },
      {
        "id": "photo2",
        "label": "Upload Photo 2 (Reverse)",
        "type": "file",
        "required": false
      }
    ]
  },
  {
    "id": "gift-timeless-frame",
    "name": "Timeless Memory 3D Acrylic Floating Lithophane Frame",
    "category": "lithophane",
    "categoryLabel": "📸 3D Photo Lithophanes",
    "price": 849,
    "originalPrice": 1250,
    "rating": 5.0,
    "reviews": 112,
    "badge": "PREMIUM",
    "img": "assets/gifts/timeless-frame_1.jpg",
    "gallery": [
      "assets/gifts/timeless-frame_1.jpg",
      "assets/gifts/timeless-frame_2.jpg",
      "assets/gifts/timeless-frame_3.jpg"
    ],
    "description": "Ultra-fine curved lithophane nestled inside a high-clarity floating acrylic frame with magnetic closures and an elegant display stand.",
    "customizationFields": [
      {
        "id": "photo",
        "label": "Upload High-Resolution Photo *",
        "type": "file",
        "required": true
      },
      {
        "id": "caption",
        "label": "Engraved Frame Caption",
        "type": "text",
        "placeholder": "e.g. You are my greatest adventure",
        "required": false
      }
    ]
  },
  {
    "id": "gift-couples-date-plank",
    "name": "Couple's Special Date & Names Plank",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 599,
    "originalPrice": 850,
    "rating": 4.8,
    "reviews": 96,
    "badge": "POPULAR",
    "img": "assets/gifts/couples-date-plank_1.png",
    "gallery": [
      "assets/gifts/couples-date-plank_1.png",
      "assets/gifts/couples-date-plank_2.png",
      "assets/gifts/couples-date-plank_3.png"
    ],
    "description": "Elegant 3D sculpted numbers highlighting your engagement, wedding, or anniversary milestone date with couple names seamlessly integrated.",
    "customizationFields": [
      {
        "id": "coupleNames",
        "label": "Couple Names *",
        "type": "text",
        "placeholder": "e.g. Rahul & Divya",
        "required": true
      },
      {
        "id": "milestoneDate",
        "label": "Milestone Date (DD-MM-YYYY) *",
        "type": "text",
        "placeholder": "e.g. 24-11-2022",
        "required": true
      },
      {
        "id": "colorCombo",
        "label": "Color Scheme",
        "type": "select",
        "options": [
          "Matte Black & Metallic Gold",
          "Ivory White & Rose Gold",
          "Crimson Red & Black",
          "Deep Navy & Silver"
        ],
        "default": "Matte Black & Metallic Gold"
      }
    ]
  },
  {
    "id": "gift-lit-couple-plank",
    "name": "LIT – Couple Silhouette Desk Plank",
    "category": "showpiece",
    "categoryLabel": "✨ 3D Sculptures & Desk Decor",
    "price": 1099,
    "originalPrice": 1699,
    "rating": 5.0,
    "reviews": 164,
    "badge": "HOT GIFT",
    "img": "assets/gifts/lit-couple-plank_1.png",
    "gallery": [
      "assets/gifts/lit-couple-plank_1.png",
      "assets/gifts/lit-couple-plank_2.png",
      "assets/gifts/lit-couple-plank_3.png"
    ],
    "description": "Precision 3D desk sculpture crafted with custom couple names, heart silhouettes, and high-definition dual-tone finish.",
    "customizationFields": [
      {
        "id": "partner1",
        "label": "Partner 1 Name *",
        "type": "text",
        "placeholder": "e.g. Aravind",
        "required": true
      },
      {
        "id": "partner2",
        "label": "Partner 2 Name *",
        "type": "text",
        "placeholder": "e.g. Keerthi",
        "required": true
      },
      {
        "id": "customWish",
        "label": "Bottom Engraved Wish",
        "type": "text",
        "placeholder": "e.g. Happy Anniversary to My Love",
        "required": false
      }
    ]
  },
  {
    "id": "gift-i-love-you-plank",
    "name": "I LOVE YOU 3D Desk Showpiece Plank",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 599,
    "originalPrice": 799,
    "rating": 4.9,
    "reviews": 88,
    "badge": "SWEET GIFT",
    "img": "assets/gifts/i-love-you-plank-1_1.jpg",
    "gallery": [
      "assets/gifts/i-love-you-plank-1_1.jpg",
      "assets/gifts/i-love-you-plank-1_2.jpg",
      "assets/gifts/i-love-you-plank-1_3.jpg"
    ],
    "description": "Bold 3D typography 'I ❤️ YOU' showpiece featuring customized couple names embossed directly onto the front base plate.",
    "customizationFields": [
      {
        "id": "customNames",
        "label": "Couple Names / Nicknames *",
        "type": "text",
        "placeholder": "e.g. Vicky & Pooja",
        "required": true
      },
      {
        "id": "heartColor",
        "label": "Heart Accent Color",
        "type": "select",
        "options": [
          "Vibrant Passion Red",
          "Metallic Rose Gold",
          "Glow-In-The-Dark Neon",
          "Glitter Pink"
        ],
        "default": "Vibrant Passion Red"
      }
    ]
  },
  {
    "id": "gift-3d-rose-name",
    "name": "3D Eternal Rose with Personalized Name Stem",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 499,
    "originalPrice": 750,
    "rating": 4.9,
    "reviews": 103,
    "badge": "EVERLASTING",
    "img": "assets/gifts/3d-rose-name_1.jpg",
    "gallery": [
      "assets/gifts/3d-rose-name_1.jpg",
      "assets/gifts/3d-rose-name_2.jpg"
    ],
    "description": "An everlasting 3D printed rose with the stem sculpted into the name of your loved one. A blooming symbol of love that never fades.",
    "customizationFields": [
      {
        "id": "roseName",
        "label": "Name for Rose Stem *",
        "type": "text",
        "placeholder": "e.g. Ananya",
        "required": true
      },
      {
        "id": "petalColor",
        "label": "Rose Petal Color",
        "type": "select",
        "options": [
          "Classic Ruby Red",
          "Velvet Dark Crimson",
          "Sweet Pastel Pink",
          "Mystic Purple",
          "Pure Silk White"
        ],
        "default": "Classic Ruby Red"
      },
      {
        "id": "stemColor",
        "label": "Stem Color",
        "type": "select",
        "options": [
          "Emerald Green",
          "Metallic Gold",
          "Pitch Black"
        ],
        "default": "Emerald Green"
      }
    ]
  },
  {
    "id": "gift-signature-name-plank",
    "name": "Signature Desk Name Plank with Custom Designation",
    "category": "showpiece",
    "categoryLabel": "✨ Personalized Showpieces",
    "price": 549,
    "originalPrice": 799,
    "rating": 4.8,
    "reviews": 74,
    "badge": "DESK ESSENTIAL",
    "img": "assets/gifts/signature-name-plank_1.png",
    "gallery": [
      "assets/gifts/signature-name-plank_1.png",
      "assets/gifts/signature-name-plank_2.png",
      "assets/gifts/signature-name-plank_3.png"
    ],
    "description": "Executive desk sculpture with 3D bold signature lettering, designation or company name. Perfect for offices, study desks, and birthday presents.",
    "customizationFields": [
      {
        "id": "mainName",
        "label": "Main Name / Title *",
        "type": "text",
        "placeholder": "e.g. Dr. Rajesh Kumar",
        "required": true
      },
      {
        "id": "subTitle",
        "label": "Designation / Subtitle",
        "type": "text",
        "placeholder": "e.g. Chief Technical Officer",
        "required": false
      },
      {
        "id": "colorStyle",
        "label": "Color Style",
        "type": "select",
        "options": [
          "Sleek Black Base + Gold Letters",
          "Marble White + Royal Blue",
          "Dark Walnut Carbon + Silver"
        ],
        "default": "Sleek Black Base + Gold Letters"
      }
    ]
  },
  {
    "id": "gift-single-name-plank",
    "name": "Single Name Monogram 3D Desk Plank",
    "category": "showpiece",
    "categoryLabel": "✨ Personalized Showpieces",
    "price": 449,
    "originalPrice": 699,
    "rating": 4.8,
    "reviews": 65,
    "badge": "CLASSIC",
    "img": "assets/gifts/single-name-plank_1.jpg",
    "gallery": [
      "assets/gifts/single-name-plank_1.jpg",
      "assets/gifts/single-name-plank_2.jpg",
      "assets/gifts/single-name-plank_3.jpg"
    ],
    "description": "Bold single name 3D sculpture with stylized capital initials and durable desktop stand. Ideal for kids bedrooms, study areas, and corporate gifts.",
    "customizationFields": [
      {
        "id": "name",
        "label": "Name for Plank *",
        "type": "text",
        "placeholder": "e.g. RITHVIK",
        "required": true
      },
      {
        "id": "fontTheme",
        "label": "Font & Color Theme",
        "type": "select",
        "options": [
          "Bold Geometric (Pitch Black + Cyan)",
          "Modern Script (Rose Gold + White)",
          "Cyberpunk (Neon Green + Black)"
        ],
        "default": "Bold Geometric (Pitch Black + Cyan)"
      }
    ]
  },
  {
    "id": "gift-heart-keychain-pack",
    "name": "Interlocking Magnetic Heart Keychains (Pack of 2)",
    "category": "keychains",
    "categoryLabel": "🔑 3D Name Keychains",
    "price": 299,
    "originalPrice": 499,
    "rating": 4.9,
    "reviews": 210,
    "badge": "BEST VALUE",
    "img": "assets/gifts/heart-keychain-pack-of-2_1.png",
    "gallery": [
      "assets/gifts/heart-keychain-pack-of-2_1.png",
      "assets/gifts/heart-keychain-pack-of-2_2.png"
    ],
    "description": "Two individual keychains that snap together into a complete 3D heart with neodymium magnets! Engraved with his & her initials or names.",
    "customizationFields": [
      {
        "id": "keychain1",
        "label": "Piece 1 Initial / Name *",
        "type": "text",
        "placeholder": "e.g. S",
        "required": true
      },
      {
        "id": "keychain2",
        "label": "Piece 2 Initial / Name *",
        "type": "text",
        "placeholder": "e.g. M",
        "required": true
      },
      {
        "id": "colorCombo",
        "label": "Keychain Color Pair",
        "type": "select",
        "options": [
          "Classic Red + Matte Black",
          "Pastel Pink + Sky Blue",
          "Gold + Silver Sparkle",
          "Pitch Black Duo"
        ],
        "default": "Classic Red + Matte Black"
      }
    ]
  },
  {
    "id": "gift-my-name-keychain",
    "name": "Custom 3D Bold Name & Number Keychain",
    "category": "keychains",
    "categoryLabel": "🔑 3D Name Keychains",
    "price": 199,
    "originalPrice": 299,
    "rating": 4.8,
    "reviews": 156,
    "badge": "POCKET FAVORITE",
    "img": "assets/gifts/my-name-keychain_1.png",
    "gallery": [
      "assets/gifts/my-name-keychain_1.png",
      "assets/gifts/my-name-keychain_2.png",
      "assets/gifts/my-name-keychain_3.png"
    ],
    "description": "High-durability PETG personalized 3D keychain with your custom name on one side and contact number or vehicle number on the reverse.",
    "customizationFields": [
      {
        "id": "keyName",
        "label": "Name for Keychain *",
        "type": "text",
        "placeholder": "e.g. DHINESH",
        "required": true
      },
      {
        "id": "keyPhone",
        "label": "Phone / Bike Number (Back)",
        "type": "text",
        "placeholder": "e.g. TN 02 AB 1234",
        "required": false
      },
      {
        "id": "color",
        "label": "Color Theme",
        "type": "select",
        "options": [
          "Pitch Black & Neon Cyan",
          "Carbon Grey & Fire Red",
          "Ivory White & Gold",
          "Military Olive & Orange"
        ],
        "default": "Pitch Black & Neon Cyan"
      }
    ]
  },
  {
    "id": "gift-photo-fridge-magnet",
    "name": "3D Photo Lithophane Fridge Magnet with Frame",
    "category": "lithophane",
    "categoryLabel": "📸 3D Photo Lithophanes",
    "price": 349,
    "originalPrice": 499,
    "rating": 4.9,
    "reviews": 128,
    "badge": "MAGNETIC",
    "img": "assets/gifts/photo-fridge-magnet_1.jpg",
    "gallery": [
      "assets/gifts/photo-fridge-magnet_1.jpg",
      "assets/gifts/photo-fridge-magnet_2.jpg",
      "assets/gifts/photo-fridge-magnet_3.jpg"
    ],
    "description": "High-detail 3D textured photo lithophane embedded in a sleek magnetic frame. Turns your kitchen fridge into an art gallery of memories.",
    "customizationFields": [
      {
        "id": "photo",
        "label": "Upload Photo *",
        "type": "file",
        "required": true
      },
      {
        "id": "caption",
        "label": "Bottom Inscribed Date / Text",
        "type": "text",
        "placeholder": "e.g. Goa Trip 2024",
        "required": false
      },
      {
        "id": "frameColor",
        "label": "Frame Color",
        "type": "select",
        "options": [
          "Pure White",
          "Pitch Black",
          "Pastel Lilac",
          "Sky Blue"
        ],
        "default": "Pure White"
      }
    ]
  },
  {
    "id": "gift-family-plank",
    "name": "Family Tree 3D Name Stand with Heart Connectors",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 799,
    "originalPrice": 1199,
    "rating": 5.0,
    "reviews": 92,
    "badge": "FAMILY SPECIAL",
    "img": "assets/gifts/family-plank_1.png",
    "gallery": [
      "assets/gifts/family-plank_1.png",
      "assets/gifts/family-plank_2.png",
      "assets/gifts/family-plank_3.png"
    ],
    "description": "Celebrate your whole family with interconnected 3D names woven through heart bridges on a weighted wooden-texture base.",
    "customizationFields": [
      {
        "id": "familyName",
        "label": "Family Title (Top) *",
        "type": "text",
        "placeholder": "e.g. The Kolanji Family",
        "required": true
      },
      {
        "id": "memberNames",
        "label": "Family Member Names (Up to 5) *",
        "type": "text",
        "placeholder": "e.g. Dhinesh, Priya, Kaviya, Sanjay",
        "required": true
      },
      {
        "id": "baseFinish",
        "label": "Base Style",
        "type": "select",
        "options": [
          "Matte Ebony Wood Look",
          "Warm Teak Wood Look",
          "Pearl White Minimalist"
        ],
        "default": "Matte Ebony Wood Look"
      }
    ]
  },
  {
    "id": "gift-family-blocks",
    "name": "3D Interlocking Family Name Letter Blocks",
    "category": "showpiece",
    "categoryLabel": "✨ Personalized Showpieces",
    "price": 699,
    "originalPrice": 999,
    "rating": 4.9,
    "reviews": 81,
    "badge": "PLAYFUL",
    "img": "assets/gifts/family-blocks_1.jpg",
    "gallery": [
      "assets/gifts/family-blocks_1.jpg",
      "assets/gifts/family-blocks_2.jpg",
      "assets/gifts/family-blocks_3.jpg"
    ],
    "description": "Interlocking modular 3D letter cubes spelling out your family name, baby milestone, or wedding hashtag in playful custom colors.",
    "customizationFields": [
      {
        "id": "blockText",
        "label": "Words / Letters (Up to 8 Letters) *",
        "type": "text",
        "placeholder": "e.g. FAMILY",
        "required": true
      },
      {
        "id": "colorPattern",
        "label": "Block Color Theme",
        "type": "select",
        "options": [
          "Rainbow Palette",
          "Nordic Pastels (Mint, Blush, Grey)",
          "Monochrome Black & White",
          "Warm Sunset Tones"
        ],
        "default": "Nordic Pastels (Mint, Blush, Grey)"
      }
    ]
  },
  {
    "id": "gift-worlds-best-partner",
    "name": "World's Best Partner 3D Trophy Plaque",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 649,
    "originalPrice": 950,
    "rating": 4.9,
    "reviews": 84,
    "badge": "HEARTFELT",
    "img": "assets/gifts/worlds-best-partner_1.png",
    "gallery": [
      "assets/gifts/worlds-best-partner_1.png",
      "assets/gifts/worlds-best-partner_2.png",
      "assets/gifts/worlds-best-partner_3.png"
    ],
    "description": "Show your husband, wife, boyfriend or girlfriend how much they mean with an official 3D sculpted 'World's Best' achievement plaque.",
    "customizationFields": [
      {
        "id": "titleFor",
        "label": "Select Recipient Title *",
        "type": "select",
        "options": [
          "World's Best Wife",
          "World's Best Husband",
          "World's Best Boyfriend",
          "World's Best Girlfriend",
          "World's Best Mom",
          "World's Best Dad"
        ],
        "default": "World's Best Wife"
      },
      {
        "id": "recipientName",
        "label": "Recipient's Name *",
        "type": "text",
        "placeholder": "e.g. Priya",
        "required": true
      },
      {
        "id": "customNote",
        "label": "Personalized Message (Base)",
        "type": "text",
        "placeholder": "e.g. Thank you for always being my rock ❤️",
        "required": false
      }
    ]
  },
  {
    "id": "gift-love-display",
    "name": "LOVE 3D Photo & Initials Shadow Display Stand",
    "category": "anniversary",
    "categoryLabel": "💑 Anniversary & Couples",
    "price": 699,
    "originalPrice": 999,
    "rating": 4.9,
    "reviews": 110,
    "badge": "NEW ARRIVAL",
    "img": "assets/gifts/love-display_1.jpg",
    "gallery": [
      "assets/gifts/love-display_1.jpg",
      "assets/gifts/love-display_2.jpg",
      "assets/gifts/love-display_3.jpg"
    ],
    "description": "3D Sculpted 'L-O-V-E' block frame with photo frame slot in the 'O' letter and couple names embossed on the base shelf.",
    "customizationFields": [
      {
        "id": "coupleNames",
        "label": "Couple Names *",
        "type": "text",
        "placeholder": "e.g. Dhinesh & Priya",
        "required": true
      },
      {
        "id": "photo",
        "label": "Upload Photo for the Frame (Optional)",
        "type": "file",
        "required": false
      },
      {
        "id": "colorCombo",
        "label": "Lettering Finish",
        "type": "select",
        "options": [
          "Classic Romantic Red & White",
          "Metallic Gold & Black",
          "Pastel Pink & Slate"
        ],
        "default": "Classic Romantic Red & White"
      }
    ]
  },
  {
    "id": "gift-couple-colour-pops",
    "name": "Couple Colour Pops – Dual Tone Custom Name Desk Stand",
    "category": "showpiece",
    "categoryLabel": "✨ Personalized Showpieces",
    "price": 549,
    "originalPrice": 799,
    "rating": 4.8,
    "reviews": 68,
    "badge": "VIBRANT",
    "img": "assets/gifts/couple-colour-pops_1.jpg",
    "gallery": [
      "assets/gifts/couple-colour-pops_1.jpg",
      "assets/gifts/couple-colour-pops_2.jpg",
      "assets/gifts/couple-colour-pops_3.jpg"
    ],
    "description": "Modern multi-color co-extruded 3D name plate with vibrant contrast highlights for living rooms and nightstands.",
    "customizationFields": [
      {
        "id": "topName",
        "label": "Top Name *",
        "type": "text",
        "placeholder": "e.g. DHINESH",
        "required": true
      },
      {
        "id": "bottomName",
        "label": "Bottom Name *",
        "type": "text",
        "placeholder": "e.g. PRIYA",
        "required": true
      },
      {
        "id": "colorPop",
        "label": "Color Contrast Choice",
        "type": "select",
        "options": [
          "Sunset Orange & Electric Cyan",
          "Sakura Pink & Pitch Black",
          "Lime Green & Charcoal",
          "Royal Gold & Velvet Maroon"
        ],
        "default": "Sunset Orange & Electric Cyan"
      }
    ]
  }
];
