const express = require("express");
const { v4: uuidv4 } = require("uuid");
const expenses = require("./mockExpenses.json");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/expenses", (req, res) => {
	res.json(expenses);
	console.log("expenses");
});

app.post("/expenses", (req, res) => {
	const { date, amount, category } = req.body;

	const newExpense = {
		id: uuidv4(),
		date,
		amount,
		category,
	};
	expenses.push(newExpense);

	fs.writeFile("mockExpenses.json", JSON.stringify(expenses), (err) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: "Failed to write to file" });
		}
		console.log("Expense added to file");
		return res.status(200).json({
			message: "Expense created",
			expense: newExpense,
		});
	});
});

app
	.route("/expenses/:id")
	.put((req, res) => {
		const expenseId = req.params.id;
		const updatedExpense = req.body;

		const index = expenses.findIndex((expense) => expense.id === expenseId);

		if (index === -1) {
			return res.status(404).json({ error: "Expense not found" });
		}

		expenses[index] = {
			...updatedExpense,
		};
		try {
			fs.writeFileSync("mockExpenses.json", JSON.stringify(expenses));
			console.log("Expense updated in file");
			return res.status(200).json({
				message: "Expense updated",
				expense: expenses[index],
			});
		} catch (err) {
			console.log(err);
			return res.status(500).json({ error: "Failed to write to file" });
		}
	})
	.get((req, res) => {
		// Retrieve expense logic
		const expenseId = req.params.id;

		const expense = expenses.find((expense) => expense.id === expenseId);

		if (!expense) {
			return res.status(404).json({ error: "Expense not found" });
		}

		return res.status(200).json(expense);
	});

app.delete("/expenses/:id", (req, res) => {
	const id = req.params.id;

	//delete the expense from the file
	const index = expenses.findIndex((expense) => expense.id === id);
	if (index === -1) {
		return res.status(404).json({ error: "Expense not found" });
	}
	expenses.splice(index, 1);
	try {
		fs.writeFileSync("mockExpenses.json", JSON.stringify(expenses));
		res.status(200).json({ message: "Expense deleted" });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ error: "Failed to write to file" });
	}
});

app.get("categories", (req, res) => {
	//get categories from db or file
	res.json({ categories: [] });
});

app.post("categories", (req, res) => {
	const data = req.body;
	//create new category
	const newCategory = {
		...data,
	};
	//add to db or file => x.push(newCategory)
	res.status(201).json({
		message: "Category created",
	});
});

app.put("categories/:id", (req, res) => {
	const id = req.params.id;
	const data = req.body;
	//update in db or file => x.map(x => x.id === id ? {...x, ...data} : x)
	res.status(200).json({
		message: "Category updated",
	});
});

app.delete("categories/:id", (req, res) => {
	const id = req.params.id;
	//delete from db or file => x.filter(x => x.id !== id)
	res.status(204).json({
		message: "Category deleted",
	});
});

app.listen(3000, () => console.log("Server running on port 3000"));
