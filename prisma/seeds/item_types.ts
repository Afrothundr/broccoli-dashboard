/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NON_PERISHABLE_TYPE } from "@/types/item-types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export const ITEM_TYPES: Record<
  string,
  {
    name: string;
    storage_advice: string;
    suggested_life_span_seconds: number;
    category: string;
  }
> = {
  Apples: {
    name: "Apples",
    storage_advice: "Refrigerate for up to 6 weeks.",
    suggested_life_span_seconds: 3628800, // 6 weeks
    category: "Fruit",
  },
  Avocados: {
    name: "Avocados",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 345600, // 4 days
    category: "Fruit",
  },
  Bananas: {
    name: "Bananas",
    storage_advice:
      "Remove any wrapping and store at room temperature away from direct sunlight. Once ripe, refrigerate for several days.",
    suggested_life_span_seconds: 518400, // 6 days
    category: "Fruit",
  },
  Citrus: {
    name: "Citrus",
    storage_advice:
      "Refrigerate loose in your low-humidity crisper drawer at 41°F to 42°F.",
    suggested_life_span_seconds: 2419200, // 4 weeks
    category: "Fruit",
  },
  Figs: {
    name: "Figs",
    storage_advice: "Refrigerate in an uncovered container.",
    suggested_life_span_seconds: 345600, // 4 days
    category: "Fruit",
  },
  Grapes: {
    name: "Grapes",
    storage_advice: "Refrigerate unwashed on stem in paper or breathable bag.",
    suggested_life_span_seconds: 691200, // 8 days
    category: "Fruit",
  },
  "Cut Melons": {
    name: "Cut Melons",
    storage_advice: "Refrigerate unwashed on stem in paper or breathable bag.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  "Whole Melons": {
    name: "Whole Melons",
    storage_advice:
      "Refrigerate after ripe. Keep out of direct sunlight when ripening.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Fruit",
  },
  Pears: {
    name: "Pears",
    storage_advice:
      "Refrigerate after ripe. Place in a closed paper bag to speed up the ripening process.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Fruit",
  },
  Apricots: {
    name: "Apricots",
    storage_advice: "Refrigerate in an open bag after ripe.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  Peaches: {
    name: "Peaches",
    storage_advice: "Refrigerate in an open bag after ripe.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  Nectarines: {
    name: "Nectarines",
    storage_advice: "Refrigerate in an open bag after ripe.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  Cherries: {
    name: "Cherries",
    storage_advice: "Refrigerate in an open bag after ripe.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  Plums: {
    name: "Plums",
    storage_advice: "Refrigerate in an open bag after ripe.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Fruit",
  },
  Pineapples: {
    name: "Pineapples",
    storage_advice:
      "Refrigerate in a low-humidity drawer. If cut, store in an airtight container.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Fruit",
  },
  Papayas: {
    name: "Papayas",
    storage_advice:
      "Refrigerate in a low-humidity drawer. If cut, store in an airtight container.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Fruit",
  },
  Mangoes: {
    name: "Mangoes",
    storage_advice:
      "Refrigerate in a low-humidity drawer. If cut, store in an airtight container.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Fruit",
  },
  Artichokes: {
    name: "Artichokes",
    storage_advice:
      "Refrigerate in a high-humidity drawer in an airtight container.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Asparagus: {
    name: "Asparagus",
    storage_advice:
      "Refrigerate upright in a bowl or dish with 1 inch of water.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Beets: {
    name: "Beets",
    storage_advice:
      "Refrigerate in a high-humidity drawer in a breathable container.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Broccoli: {
    name: "Broccoli",
    storage_advice:
      "Store loosely wrapped in a refrigerator crisper drawer set to high-humidity.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Vegetables",
  },
  "Brussels sprouts": {
    name: "Brussels sprouts",
    storage_advice:
      "Store loosely wrapped in a refrigerator crisper drawer set to high-humidity.",
    suggested_life_span_seconds: dayjs.duration({ days: 10 }).asSeconds(),
    category: "Vegetables",
  },
  "Self Destructing Spinach": {
    name: "Self Destructing Spinach",
    storage_advice: "Good luck",
    suggested_life_span_seconds: dayjs.duration({ days: 7 }).asSeconds(), // 7 days to match regular spinach
    category: "Test",
  },
  Carrots: {
    name: "Carrots",
    storage_advice: "Store in the refrigerator in a high-humidity drawer.",
    suggested_life_span_seconds: 1209600,
    category: "Vegetables",
  },
  Cauliflower: {
    name: "Cauliflower",
    storage_advice:
      "Store in the refrigerator in a high-humidity drawer with a breathable bag.",
    suggested_life_span_seconds: 432000,
    category: "Vegetables",
  },
  Celery: {
    name: "Celery",
    storage_advice: "Store in the refrigerator upright in a jar of water.",
    suggested_life_span_seconds: 1209600,
    category: "Vegetables",
  },
  "Corn on the cob": {
    name: "Corn on the cob",
    storage_advice: "Eat ASAP. Store in the upper section of the refrigerator.",
    suggested_life_span_seconds: 172800,
    category: "Vegetables",
  },
  Cucumbers: {
    name: "Cucumbers",
    storage_advice:
      "Refrigerate in the high-humidity drawer or store in a cool place on the counter.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  Eggplant: {
    name: "Eggplant",
    storage_advice: "Store in a cool dry place.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  Garlic: {
    name: "Garlic",
    storage_advice: "Store in a cool dark dry place.",
    suggested_life_span_seconds: 2419200,
    category: "Vegetables",
  },
  Shallots: {
    name: "Shallots",
    storage_advice: "Store in a cool dark dry place.",
    suggested_life_span_seconds: 1814400,
    category: "Vegetables",
  },
  Ginger: {
    name: "Ginger",
    storage_advice: "Refrigerate in an airtight container.",
    suggested_life_span_seconds: 2592000,
    category: "Vegetables",
  },
  "Green Beans": {
    name: "Green Beans",
    storage_advice: "Refrigerate in a breathable container. Eat ASAP.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  "Snap Peas": {
    name: "Snap Peas",
    storage_advice: "Refrigerate in a breathable container. Eat ASAP.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  "Fresh Peas": {
    name: "Fresh Peas",
    storage_advice: "Refrigerate in a breathable container. Eat ASAP.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  "Green Onions": {
    name: "Green Onions",
    storage_advice:
      "Refrigerate in a breathable bag in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  Cheese: {
    name: "Cheese",
    storage_advice: "Store in the refrigerator in an airtight container.",
    suggested_life_span_seconds: 1209600,
    category: "Dairy",
  },
  Kiwi: {
    name: "Kiwi",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Lemon: {
    name: "Lemon",
    storage_advice: "Store at room temperature or in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Fruit",
  },
  Lime: {
    name: "Lime",
    storage_advice: "Store at room temperature or in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Fruit",
  },
  Mango: {
    name: "Mango",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Nectarine: {
    name: "Nectarine",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Orange: {
    name: "Orange",
    storage_advice: "Store at room temperature or in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Fruit",
  },
  Papaya: {
    name: "Papaya",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  "Passion Fruit": {
    name: "Passion Fruit",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Fruit",
  },
  Peach: {
    name: "Peach",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Pineapple: {
    name: "Pineapple",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Plum: {
    name: "Plum",
    storage_advice:
      "Store at room temperature until ripe, then transfer to the refrigerator.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },
  Pomegranate: {
    name: "Pomegranate",
    storage_advice: "Store at room temperature.",
    suggested_life_span_seconds: 1209600,
    category: "Fruit",
  },
  Grapefruit: {
    name: "Grapefruit",
    storage_advice: "Store at room temperature or in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Fruit",
  },
  "Oat Milk": {
    name: "Oat Milk",
    storage_advice: "Store in the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Non-Dairy Milk",
  },
  Mushroom: {
    name: "Mushroom",
    storage_advice: "Store in the refrigerator.",
    suggested_life_span_seconds: 345600,
    category: "Vegetables",
  },
  Onion: {
    name: "Onion",
    storage_advice: "Store in a cool, dry place away from direct sunlight.",
    suggested_life_span_seconds: 1209600,
    category: "Vegetables",
  },
  Beet: {
    name: "Beet",
    storage_advice: "Store in the refrigerator.",
    suggested_life_span_seconds: 864000,
    category: "Vegetables",
  },
  Kale: {
    name: "Kale",
    storage_advice:
      "Store in a high-humidity drawer. Do not wash until ready to use.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Chard: {
    name: "Chard",
    storage_advice:
      "Store in a high-humidity drawer. Do not wash until ready to use.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  "Bok Choy": {
    name: "Bok Choy",
    storage_advice:
      "Store in a high-humidity drawer. Do not wash until ready to use.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  "Collard Greens": {
    name: "Collard Greens",
    storage_advice:
      "Store in a high-humidity drawer. Do not wash until ready to use.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Cabbage: {
    name: "Cabbage",
    storage_advice:
      "Store in a high-humidity drawer. Do not wash until ready to use.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Lettuce: {
    name: "Lettuce",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Arugula: {
    name: "Arugula",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Endive: {
    name: "Endive",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Radicchio: {
    name: "Radicchio",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Spinach: {
    name: "Spinach",
    storage_advice: "Store in a high-humidity drawer in an airtight container.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Basil: {
    name: "Basil",
    storage_advice:
      "Trim ends and place in a tall glass of water like fresh cut flowers. Store outside of refrigerator. Loosely cover and change water daily.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Rosemary: {
    name: "Rosemary",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Parsley: {
    name: "Parsley",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Cilantro: {
    name: "Cilantro",
    storage_advice:
      "Trim ends and place in a tall glass of water like fresh cut flowers. Store on top shelf of refrigerator. Loosely cover and change water daily.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Dill: {
    name: "Dill",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Lavender: {
    name: "Lavender",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Mint: {
    name: "Mint",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Sage: {
    name: "Sage",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Thyme: {
    name: "Thyme",
    storage_advice:
      "Store loosely in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Herbs",
  },
  Mushrooms: {
    name: "Mushrooms",
    storage_advice:
      "Eat ASAP. Store in the lower shelf of the refrigerator in original packaging.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Mushrooms",
  },
  Onions: {
    name: "Onions",
    storage_advice: "Store in a cool place away from sunlight.",
    suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
    category: "Vegetables",
  },
  Parsnips: {
    name: "Parsnips",
    storage_advice:
      "Store in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Peppers: {
    name: "Peppers",
    storage_advice:
      "Store in a breathable bag in the low-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Vegetables",
  },
  Potatoes: {
    name: "Potatoes",
    storage_advice: "Store in a breathable bag in a cool dark place.",
    suggested_life_span_seconds: dayjs.duration({ months: 1 }).asSeconds(),
    category: "Vegetables",
  },
  Radishes: {
    name: "Radishes",
    storage_advice:
      "Store in a breathable bag in the high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs
      .duration({ weeks: 1, days: 3 })
      .asSeconds(),
    category: "Vegetables",
  },
  Squash: {
    name: "Squash",
    storage_advice: "Store in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
    category: "Vegetables",
  },
  Zucchini: {
    name: "Zucchini",
    storage_advice: "Store in a high-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Vegetables",
  },
  "Sweet Potatoes": {
    name: "Sweet Potatoes",
    storage_advice: "Store in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
    category: "Vegetables",
  },
  Tomatoes: {
    name: "Tomatoes",
    storage_advice: "Store at room temperature away from direct sunlight.",
    suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
    category: "Vegetables",
  },
  Turnips: {
    name: "Turnips",
    storage_advice: "Store in the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
    category: "Vegetables",
  },
  Bacon: {
    name: "Bacon",
    storage_advice: "Store in the refrigerator in original packaging.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Meat",
  },
  "Deli meat": {
    name: "Deli meat",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in original packaging.",
    suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
    category: "Meat",
  },
  "Fresh meat": {
    name: "Fresh meat",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging.",
    suggested_life_span_seconds: dayjs.duration({ days: 2 }).asSeconds(),
    category: "Meat",
  },
  "Hot dogs or precooked sausage": {
    name: "Hot dogs or precooked sausage",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
    category: "Meat",
  },
  "Frozen shellfish": {
    name: "Frozen shellfish",
    storage_advice: "Freeze in airtight packaging.",
    suggested_life_span_seconds: dayjs.duration({ months: 4 }).asSeconds(),
    category: "Meat",
  },
  Bread: {
    name: "Bread",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
    category: "Pantry",
  },
  Flour: {
    name: "Flour",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ months: 8 }).asSeconds(),
    category: "Pantry",
  },
  Oats: {
    name: "Oats",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 1 }).asSeconds(),
    category: "Pantry",
  },
  Pasta: {
    name: "Pasta",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 2 }).asSeconds(),
    category: "Pantry",
  },
  Quinoa: {
    name: "Quinoa",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 2 }).asSeconds(),
    category: "Pantry",
  },
  Rice: {
    name: "Rice",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
    category: "Pantry",
  },
  Sugar: {
    name: "Sugar",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
    category: "Pantry",
  },
  "Whole Grains": {
    name: "Whole grains",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
    category: "Pantry",
  },
  Butter: {
    name: "Butter",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
    category: "Dairy",
  },
  "Hard Cheese": {
    name: "Hard Cheese",
    storage_advice:
      "Store in the refrigerator drawer wrapped loosely in paper or wax.",
    suggested_life_span_seconds: dayjs.duration({ months: 1 }).asSeconds(),
    category: "Dairy",
  },
  "Soft Cheese": {
    name: "Soft Cheese",
    storage_advice:
      "Store in the refrigerator drawer wrapped loosely in paper or wax.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
    category: "Dairy",
  },
  "Cottage Cheese": {
    name: "Cottage Cheese",
    storage_advice: "Store in a closed container in the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ days: 7 }).asSeconds(),
    category: "Dairy",
  },
  Eggs: {
    name: "Eggs",
    storage_advice: "Keep in the cold part of the refrigerator.",
    suggested_life_span_seconds: dayjs.duration({ weeks: 3 }).asSeconds(),
    category: "Eggs",
  },
  Milk: {
    name: "Milk",
    storage_advice: "Keep in the cold part of the refrigerator.",
    suggested_life_span_seconds: dayjs
      .duration({ weeks: 1, days: 2 })
      .asSeconds(),
    category: "Dairy",
  },
  Yogurt: {
    name: "Yogurt",
    storage_advice: "Keep in the cold part of the refrigerator.",
    suggested_life_span_seconds: dayjs
      .duration({ weeks: 2, days: 3 })
      .asSeconds(),
    category: "Dairy",
  },
  Tofu: {
    name: "Tofu",
    storage_advice: "Refrigerate in original packaging.",
    suggested_life_span_seconds: dayjs.duration({ days: 10 }).asSeconds(),
    category: "Proteins",
  },
  "Coconut Milk": {
    name: "Coconut Milk",
    storage_advice: "Refrigerate in an airtight container.",
    suggested_life_span_seconds: dayjs
      .duration({ weeks: 2, days: 3 })
      .asSeconds(),
    category: "Dairy",
  },
  [NON_PERISHABLE_TYPE]: {
    name: NON_PERISHABLE_TYPE,
    storage_advice: "",
    suggested_life_span_seconds: 0,
    category: "Other",
  },
  "Frozen food": {
    name: "Frozen food",
    storage_advice: "",
    suggested_life_span_seconds: 0,
    category: "Frozen",
  },
  Strawberries: {
    name: "Strawberries",
    storage_advice:
      "Refrigerate unwashed in original container. Wash just before eating.",
    suggested_life_span_seconds: 432000,
    category: "Fruit",
  },
  Blueberries: {
    name: "Blueberries",
    storage_advice:
      "Refrigerate unwashed in original container in high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Fruit",
  },
  Watermelon: {
    name: "Watermelon",
    storage_advice:
      "Store whole at room temperature. Refrigerate cut pieces in airtight container.",
    suggested_life_span_seconds: 604800,
    category: "Fruit",
  },
  Cantaloupe: {
    name: "Cantaloupe",
    storage_advice:
      "Store whole at room temperature until ripe, then refrigerate. Refrigerate cut pieces immediately.",
    suggested_life_span_seconds: 432000,
    category: "Fruit",
  },
  Tangerine: {
    name: "Tangerine",
    storage_advice: "Store at room temperature or in the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Fruit",
  },
  Blackberries: {
    name: "Blackberries",
    storage_advice:
      "Refrigerate unwashed in original container. Very delicate, eat ASAP.",
    suggested_life_span_seconds: 259200,
    category: "Fruit",
  },

  // VEGETABLES (15 items)
  "Bell Peppers": {
    name: "Bell Peppers",
    storage_advice:
      "Store in a breathable bag in the low-humidity drawer of the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Jalapeño Peppers": {
    name: "Jalapeño Peppers",
    storage_advice: "Store in a breathable bag in the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Poblano Peppers": {
    name: "Poblano Peppers",
    storage_advice: "Store in a breathable bag in the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Romaine Lettuce": {
    name: "Romaine Lettuce",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Butterhead Lettuce": {
    name: "Butterhead Lettuce",
    storage_advice:
      "Store in an airtight container in the high-humidity drawer.",
    suggested_life_span_seconds: 432000,
    category: "Vegetables",
  },
  "Broccoli Rabe": {
    name: "Broccoli Rabe",
    storage_advice:
      "Store loosely wrapped in a breathable bag in high-humidity drawer.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  Scallions: {
    name: "Scallions",
    storage_advice:
      "Refrigerate in a breathable bag in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  Leeks: {
    name: "Leeks",
    storage_advice:
      "Refrigerate in a breathable bag in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Baby Carrots": {
    name: "Baby Carrots",
    storage_advice:
      "Store in the refrigerator in original packaging or airtight container.",
    suggested_life_span_seconds: 1209600,
    category: "Vegetables",
  },
  "Cherry Tomatoes": {
    name: "Cherry Tomatoes",
    storage_advice: "Store at room temperature away from direct sunlight.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  "Grape Tomatoes": {
    name: "Grape Tomatoes",
    storage_advice: "Store at room temperature away from direct sunlight.",
    suggested_life_span_seconds: 259200,
    category: "Vegetables",
  },
  "Brussels Sprouts": {
    name: "Brussels Sprouts",
    storage_advice:
      "Store loosely wrapped in a refrigerator crisper drawer set to high-humidity.",
    suggested_life_span_seconds: 864000,
    category: "Vegetables",
  },
  Fennel: {
    name: "Fennel",
    storage_advice: "Store in a breathable bag in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },
  "Mini Cucumbers": {
    name: "Mini Cucumbers",
    storage_advice: "Refrigerate in the high-humidity drawer.",
    suggested_life_span_seconds: 604800,
    category: "Vegetables",
  },

  // PROTEINS/MEAT/SEAFOOD (8 items)
  "Chicken Breast": {
    name: "Chicken Breast",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging. Freeze for longer storage.",
    suggested_life_span_seconds: 172800,
    category: "Meat",
  },
  "Ground Beef": {
    name: "Ground Beef",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging. Freeze for longer storage.",
    suggested_life_span_seconds: 172800,
    category: "Meat",
  },
  "Pork Chops": {
    name: "Pork Chops",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging. Freeze for longer storage.",
    suggested_life_span_seconds: 259200,
    category: "Meat",
  },
  "Salmon Fillet": {
    name: "Salmon Fillet",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging. Use ASAP.",
    suggested_life_span_seconds: 172800,
    category: "Meat",
  },
  Shrimp: {
    name: "Shrimp",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging. Use ASAP or freeze.",
    suggested_life_span_seconds: 172800,
    category: "Meat",
  },
  "Turkey Breast": {
    name: "Turkey Breast",
    storage_advice:
      "Store on the bottom shelf of the refrigerator in airtight packaging.",
    suggested_life_span_seconds: 172800,
    category: "Meat",
  },
  "Sausage Links": {
    name: "Sausage Links",
    storage_advice: "Store in the refrigerator in original packaging.",
    suggested_life_span_seconds: 604800,
    category: "Meat",
  },

  // DAIRY (7 items)
  "Sour Cream": {
    name: "Sour Cream",
    storage_advice: "Store in an airtight container in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Dairy",
  },
  "Cream Cheese": {
    name: "Cream Cheese",
    storage_advice:
      "Store in original packaging or airtight container in the refrigerator.",
    suggested_life_span_seconds: 1209600,
    category: "Dairy",
  },
  "Parmesan Cheese": {
    name: "Parmesan Cheese",
    storage_advice:
      "Store wrapped in wax paper or parchment in the refrigerator.",
    suggested_life_span_seconds: 2419200,
    category: "Dairy",
  },
  "Mozzarella Cheese": {
    name: "Mozzarella Cheese",
    storage_advice: "Store in brine or airtight container in the refrigerator.",
    suggested_life_span_seconds: 604800,
    category: "Dairy",
  },
  "Cheddar Cheese": {
    name: "Cheddar Cheese",
    storage_advice:
      "Store wrapped in wax paper or parchment in the refrigerator.",
    suggested_life_span_seconds: 2419200,
    category: "Dairy",
  },
  "Heavy Cream": {
    name: "Heavy Cream",
    storage_advice:
      "Keep in the cold part of the refrigerator in original container.",
    suggested_life_span_seconds: 1209600,
    category: "Dairy",
  },
  "Half and Half": {
    name: "Half and Half",
    storage_advice:
      "Keep in the cold part of the refrigerator in original container.",
    suggested_life_span_seconds: 604800,
    category: "Dairy",
  },

  // PANTRY ITEMS (10 items)
  "Canned Beans": {
    name: "Canned Beans",
    storage_advice:
      "Store in a cool dry place. Refrigerate after opening in airtight container.",
    suggested_life_span_seconds: 63072000,
    category: "Pantry",
  },
  "Canned Tomatoes": {
    name: "Canned Tomatoes",
    storage_advice:
      "Store in a cool dry place. Refrigerate after opening in airtight container.",
    suggested_life_span_seconds: 63072000,
    category: "Pantry",
  },
  "Olive Oil": {
    name: "Olive Oil",
    storage_advice: "Store in a cool dark place away from heat and light.",
    suggested_life_span_seconds: 31536000,
    category: "Pantry",
  },
  "Vegetable Oil": {
    name: "Vegetable Oil",
    storage_advice: "Store in a cool dark place away from heat and light.",
    suggested_life_span_seconds: 31536000,
    category: "Pantry",
  },
  "Tortilla Chips": {
    name: "Tortilla Chips",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: 1814400,
    category: "Pantry",
  },
  Crackers: {
    name: "Crackers",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: 2592000,
    category: "Pantry",
  },
  "Peanut Butter": {
    name: "Peanut Butter",
    storage_advice:
      "Store in a cool dry place. Refrigerate natural peanut butter after opening.",
    suggested_life_span_seconds: 15552000,
    category: "Pantry",
  },
  Honey: {
    name: "Honey",
    storage_advice:
      "Store in a cool dry place. Does not require refrigeration.",
    suggested_life_span_seconds: 252288000,
    category: "Pantry",
  },
  "Maple Syrup": {
    name: "Maple Syrup",
    storage_advice: "Refrigerate after opening in original container.",
    suggested_life_span_seconds: 31536000,
    category: "Pantry",
  },
  Cereal: {
    name: "Cereal",
    storage_advice: "Store in an airtight container in a cool dry place.",
    suggested_life_span_seconds: 5184000,
    category: "Pantry",
  },

  // FROZEN ITEMS (3 items)
  "Frozen Vegetables": {
    name: "Frozen Vegetables",
    storage_advice: "Keep frozen at 0°F (-18°C) or below.",
    suggested_life_span_seconds: 31536000,
    category: "Frozen",
  },
  "Frozen Berries": {
    name: "Frozen Berries",
    storage_advice: "Keep frozen at 0°F (-18°C) or below.",
    suggested_life_span_seconds: 31536000,
    category: "Frozen",
  },
  "Ice Cream": {
    name: "Ice Cream",
    storage_advice:
      "Keep frozen at 0°F (-18°C) or below. Store in back of freezer.",
    suggested_life_span_seconds: 5184000,
    category: "Frozen",
  },

  // BEVERAGES (4 items)
  "Orange Juice": {
    name: "Orange Juice",
    storage_advice: "Refrigerate in original container. Shake before use.",
    suggested_life_span_seconds: 604800,
    category: "Beverages",
  },
  Soda: {
    name: "Soda",
    storage_advice: "Store in a cool dry place. Refrigerate for best taste.",
    suggested_life_span_seconds: 15552000,
    category: "Beverages",
  },
  "Sparkling Water": {
    name: "Sparkling Water",
    storage_advice: "Store in a cool dry place. Refrigerate for best taste.",
    suggested_life_span_seconds: 7776000,
    category: "Beverages",
  },
  Coffee: {
    name: "Coffee",
    storage_advice:
      "Store whole beans in an airtight container in a cool dark place. Freeze for longer storage.",
    suggested_life_span_seconds: 1209600,
    category: "Beverages",
  },

  // CONDIMENTS & SAUCES (3 items)
  Ketchup: {
    name: "Ketchup",
    storage_advice: "Refrigerate after opening. Store in original container.",
    suggested_life_span_seconds: 15552000,
    category: "Pantry",
  },
  Mustard: {
    name: "Mustard",
    storage_advice: "Refrigerate after opening. Store in original container.",
    suggested_life_span_seconds: 31536000,
    category: "Pantry",
  },
  "Soy Sauce": {
    name: "Soy Sauce",
    storage_advice:
      "Store in a cool dark place. Refrigerate after opening for best quality.",
    suggested_life_span_seconds: 63072000,
    category: "Pantry",
  },
};
