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
		storage_advice: "You can store up to 6-ish weeks in the refrigerator",
		suggested_life_span_seconds: 126096,
		category: "Fruit",
	},
	Avocados: {
		name: "Avocados",
		storage_advice:
			"Store at room temperature until ripe, then transfer to the refrigerator.",
		suggested_life_span_seconds: 12000,
		category: "Fruit",
	},
	Bananas: {
		name: "Bananas",
		storage_advice:
			"Remove any wrapping and store at room temperature, away from direct sunlight. Once ripe, you can store them in the refrigerator for several days",
		suggested_life_span_seconds: 14000,
		category: "Fruit",
	},
	Citrus: {
		name: "Citrus",
		storage_advice:
			"Refrigerate loose in your low-humidity crisper drawer at 41°F to 42°F",
		suggested_life_span_seconds: 960,
		category: "Fruit",
	},
	Figs: {
		name: "Figs",
		storage_advice: "Refrigerate in an uncovered container",
		suggested_life_span_seconds: 480,
		category: "Fruit",
	},
	Grapes: {
		name: "Grapes",
		storage_advice: "Refrigerate unwashed on stem in paper or breathable bag",
		suggested_life_span_seconds: 1408,
		category: "Fruit",
	},
	"Cut Melons": {
		name: "Cut Melons",
		storage_advice: "Refrigerate unwashed on stem in paper or breathable bag",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Fruit",
	},
	"Whole Melons": {
		name: "Whole Melons",
		storage_advice:
			"Refrigerate after ripe, keep out of direct sunlight when ripening",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Fruit",
	},
	Pears: {
		name: "Pears",
		storage_advice:
			"Refrigerate after ripe. Place them in a closed paper bag to speed up the ripening process.",
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
			"Refrigerate in a low humidity drawer, if cut store in an airtight container.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Fruit",
	},
	Papayas: {
		name: "Papayas",
		storage_advice:
			"Refrigerate in a low humidity drawer, if cut store in an airtight container.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Fruit",
	},
	Mangoes: {
		name: "Mangoes",
		storage_advice:
			"Refrigerate in a low humidity drawer, if cut store in an airtight container.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Fruit",
	},
	Artichokes: {
		name: "Artichokes",
		storage_advice:
			"Refrigerate in a high humidity drawer in airtight container.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Asparagus: {
		name: "Asparagus",
		storage_advice:
			"Refrigerate upright in a bowl or dish with 1 inch of water",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Beets: {
		name: "Beets",
		storage_advice:
			"Refrigerate in a high humidity drawer in breathable container.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Broccoli: {
		name: "Broccoli",
		storage_advice:
			'Store loosely wrapped in a refrigerator crisper drawer set to "High-Humidity"',
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Vegetables",
	},
	"Brussels sprouts": {
		name: "Brussels sprouts",
		storage_advice:
			'Store loosely wrapped in a refrigerator crisper drawer set to "High-Humidity"',
		suggested_life_span_seconds: dayjs.duration({ days: 10 }).asSeconds(),
		category: "Vegetables",
	},
	"Self Destructing Spinach": {
		name: "Self Destructing Spinach",
		storage_advice: "Good luck",
		suggested_life_span_seconds: dayjs.duration({ minutes: 1 }).asSeconds(),
		category: "Test",
	},
	Carrots: {
		name: "Carrots",
		storage_advice: "Store in the refrigerator in high-humidity drawer.",
		suggested_life_span_seconds: 1209600,
		category: "Vegetables",
	},
	Cauliflower: {
		name: "Cauliflower",
		storage_advice:
			"Store in the refrigerator in high-humidity drawer with a breathable bag.",
		suggested_life_span_seconds: 432000,
		category: "Vegetables",
	},
	Celery: {
		name: "Celery",
		storage_advice: "Store in the refrigerator upright in a jar of water",
		suggested_life_span_seconds: 1209600,
		category: "Vegetables",
	},
	"Corn on the cob": {
		name: "Corn on the cob",
		storage_advice: "Eat ASAP, store in upper section of refrigerator",
		suggested_life_span_seconds: 172800,
		category: "Vegetables",
	},
	Cucumbers: {
		name: "Cucumbers",
		storage_advice:
			"Refrigerate in the high-humidity drawer or store in a cool place on the counter",
		suggested_life_span_seconds: 604800,
		category: "Vegetables",
	},
	Eggplant: {
		name: "Eggplant",
		storage_advice: "Store loose in a cool place",
		suggested_life_span_seconds: 604800,
		category: "Vegetables",
	},
	Garlic: {
		name: "Garlic",
		storage_advice: "Store in cool dark dry place",
		suggested_life_span_seconds: 2419200,
		category: "Vegetables",
	},
	Shallots: {
		name: "Shallots",
		storage_advice: "Store in cool dark dry place",
		suggested_life_span_seconds: 1814400,
		category: "Vegetables",
	},
	Ginger: {
		name: "Ginger",
		storage_advice: "Refrigerate in airtight container",
		suggested_life_span_seconds: 2592000,
		category: "Vegetables",
	},
	"Green Beans": {
		name: "Green Beans",
		storage_advice: "Refrigerate in breathable container, eat ASAP",
		suggested_life_span_seconds: 259200,
		category: "Vegetables",
	},
	"Snap Peas": {
		name: "Snap Peas",
		storage_advice: "Refrigerate in breathable container, eat ASAP",
		suggested_life_span_seconds: 259200,
		category: "Vegetables",
	},
	"Fresh Peas": {
		name: "Fresh Peas",
		storage_advice: "Refrigerate in breathable container, eat ASAP",
		suggested_life_span_seconds: 259200,
		category: "Vegetables",
	},
	"Green Onions": {
		name: "Green Onions",
		storage_advice: "Refrigerate in breathable bag in the high-humidity drawer",
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
			"Store in high-humidity drawer, do not wash until ready to use.",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Chard: {
		name: "Chard",
		storage_advice:
			"Store in high-humidity drawer, do not wash until ready to use.",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	"Bok Choy": {
		name: "Bok Choy",
		storage_advice:
			"Store in high-humidity drawer, do not wash until ready to use.",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	"Collard Greens": {
		name: "Collard Greens",
		storage_advice:
			"Store in high-humidity drawer, do not wash until ready to use.",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Cabbage: {
		name: "Cabbage",
		storage_advice:
			"Store in high-humidity drawer, do not wash until ready to use.",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Lettuce: {
		name: "Lettuce",
		storage_advice: "Store in air-tight container in the high-humidity drawer.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Arugula: {
		name: "Arugula",
		storage_advice: "Store in air-tight container in the high-humidity drawer.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Endive: {
		name: "Endive",
		storage_advice: "Store in air-tight container in the high-humidity drawer.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Radicchio: {
		name: "Radicchio",
		storage_advice: "Store in air-tight container in the high-humidity drawer.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Spinach: {
		name: "Spinach",
		storage_advice: "Store in air-tight container in the high-humidity drawer.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Basil: {
		name: "Basil",
		storage_advice:
			"Trim ends and place in a tall glass of water outside of a refrigerator like fresh cut flowers. Loosely cover and change water daily",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Rosemary: {
		name: "Rosemary",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Parsley: {
		name: "Parsley",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Cilantro: {
		name: "Cilantro",
		storage_advice:
			"Trim ends and place in a tall glass of water on top shelf of a refrigerator like fresh cut flowers. Loosely cover and change water daily",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Dill: {
		name: "Dill",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Lavender: {
		name: "Lavender",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Mint: {
		name: "Mint",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Sage: {
		name: "Sage",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Thyme: {
		name: "Thyme",
		storage_advice:
			"Store loosely in a breathable bag in the high-humidity drawer of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Herbs",
	},
	Mushrooms: {
		name: "Mushrooms",
		storage_advice:
			"Use ASAP. Store in lower shelf of refrigerator in original packaging.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Mushrooms",
	},
	Onions: {
		name: "Onions",
		storage_advice: "Store in cool place away from sunlight",
		suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
		category: "Vegetables",
	},
	Parsnips: {
		name: "Parsnips",
		storage_advice:
			"Store in breathable bag in high-humidity drawer of refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Peppers: {
		name: "Peppers",
		storage_advice:
			"Store in breathable bag in low-humidity drawer of refrigerator",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Vegetables",
	},
	Potatoes: {
		name: "Potatoes",
		storage_advice: "Store in breathable bag in cool dark place.",
		suggested_life_span_seconds: dayjs.duration({ months: 1 }).asSeconds(),
		category: "Vegetables",
	},
	Radishes: {
		name: "Radishes",
		storage_advice:
			"Separate green tops from rest. Store in breathable bag in high-humidity drawer of refrigerator.",
		suggested_life_span_seconds: dayjs
			.duration({ weeks: 1, days: 3 })
			.asSeconds(),
		category: "Vegetables",
	},
	Squash: {
		name: "Squash",
		storage_advice: "Store in cool dry place.",
		suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
		category: "Vegetables",
	},
	Zucchini: {
		name: "Zucchini",
		storage_advice: "Store in high-humidity drawer of refrigerator.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Vegetables",
	},
	"Sweet Potatoes": {
		name: "Sweet Potatoes",
		storage_advice: "Store in cool dry place.",
		suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
		category: "Vegetables",
	},
	Tomatoes: {
		name: "Tomatoes",
		storage_advice: "Store at room temperature away from direct sunlight",
		suggested_life_span_seconds: dayjs.duration({ days: 3 }).asSeconds(),
		category: "Vegetables",
	},
	Turnips: {
		name: "Turnips",
		storage_advice: "Store refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
		category: "Vegetables",
	},
	Bacon: {
		name: "Bacon",
		storage_advice: "Store refrigerator in original packaging.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Meat",
	},
	"Deli meat": {
		name: "Deli meat",
		storage_advice:
			"Store on bottom shelf of refrigerator in original packaging.",
		suggested_life_span_seconds: dayjs.duration({ days: 5 }).asSeconds(),
		category: "Meat",
	},
	"Fresh meat": {
		name: "Fresh meat",
		storage_advice:
			"Store on bottom shelf of refrigerator in airtight packaging.",
		suggested_life_span_seconds: dayjs.duration({ days: 2 }).asSeconds(),
		category: "Meat",
	},
	"Hot dogs or precooked sausage": {
		name: "Hot dogs or precooked sausage",
		storage_advice:
			"Store on bottom shelf of refrigerator in airtight packaging.",
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
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ weeks: 1 }).asSeconds(),
		category: "Pantry",
	},
	Flour: {
		name: "Flour",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ months: 8 }).asSeconds(),
		category: "Pantry",
	},
	Oats: {
		name: "Oats",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 1 }).asSeconds(),
		category: "Pantry",
	},
	Pasta: {
		name: "Pasta",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 2 }).asSeconds(),
		category: "Pantry",
	},
	Quinoa: {
		name: "Quinoa",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 2 }).asSeconds(),
		category: "Pantry",
	},
	Rice: {
		name: "Rice",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
		category: "Pantry",
	},
	Sugar: {
		name: "Sugar",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
		category: "Pantry",
	},
	"Whole Grains": {
		name: "Whole grains",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ years: 8 }).asSeconds(),
		category: "Pantry",
	},
	Butter: {
		name: "Butter",
		storage_advice: "Store in an airtight container in a cool dry place",
		suggested_life_span_seconds: dayjs.duration({ months: 2 }).asSeconds(),
		category: "Dairy",
	},
	"Hard Cheese": {
		name: "Hard Cheese",
		storage_advice:
			"Store in refrigerator drawer wrapped loosely in paper or wax",
		suggested_life_span_seconds: dayjs.duration({ months: 1 }).asSeconds(),
		category: "Dairy",
	},
	"Soft Cheese": {
		name: "Soft Cheese",
		storage_advice:
			"Store in refrigerator drawer wrapped loosely in paper or wax",
		suggested_life_span_seconds: dayjs.duration({ weeks: 2 }).asSeconds(),
		category: "Dairy",
	},
	"Cottage Cheese": {
		name: "Cottage Cheese",
		storage_advice: "Store in closed container in the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ days: 7 }).asSeconds(),
		category: "Dairy",
	},
	Eggs: {
		name: "Eggs",
		storage_advice: "Keep in cold part of the refrigerator",
		suggested_life_span_seconds: dayjs.duration({ weeks: 3 }).asSeconds(),
		category: "Eggs",
	},
	Milk: {
		name: "Milk",
		storage_advice: "Keep in cold part of the refrigerator",
		suggested_life_span_seconds: dayjs
			.duration({ weeks: 1, days: 2 })
			.asSeconds(),
		category: "Dairy",
	},
	Yogurt: {
		name: "Yogurt",
		storage_advice: "Keep in cold part of the refrigerator",
		suggested_life_span_seconds: dayjs
			.duration({ weeks: 2, days: 3 })
			.asSeconds(),
		category: "Dairy",
	},
	Tofu: {
		name: "Tofu",
		storage_advice: "Refrigerate in original packaging",
		suggested_life_span_seconds: dayjs.duration({ days: 10 }).asSeconds(),
		category: "Proteins",
	},
	"Coconut Milk": {
		name: "Coconut Milk",
		storage_advice: "Refrigerate airtight container",
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
};
