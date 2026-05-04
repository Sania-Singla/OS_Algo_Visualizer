# OS Algorithm Visualizer

An interactive web-based platform to visualize Operating System algorithms in action. This project is designed to help students and developers better understand complex OS concepts through step-by-step animations and an intuitive UI.

This project provides an interactive interface where users can:
- Select different OS algorithms  
- Adjust parameters  
- Watch execution step-by-step  

🔗 **Live Demo:** https://visualosbysania.vercel.app

---

## ✨ Features

- **Interactive Visualizations** – Step-by-step execution of OS algorithms  
- **User-Controlled Simulation** – Control speed, inputs, and execution flow  
- **Algorithm Insights** – Understand internal working with visual feedback  
- **Modern UI** – Clean and responsive interface built with React  
- **Dynamic Updates** – Real-time rendering of algorithm states  

---

## 🧠 Algorithms Covered

### CPU Scheduling Algorithms
- First Come First Serve (FCFS)  
- Shortest Job First (SJF)
- Shortest Remaining Time First (SRTF) 
- Round Robin (RR)  
- Priority Scheduling  

### Disk Scheduling Algorithms  
- FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK

### Deadlock Management
- Banker's Algorithm

### Memory Management Algorithms  
- Page Replacement
- Buddy Allocator

---

## 🛠️ Tech Stack

- JavaScript (ES6+)  
- React.js  
- HTML5  
- CSS3  

---

## 📂 Project Structure
```
OS_Algo_Visualizer/
│── public/
│── src/
│ ├── components/
│ └── pages/
|   ├── CPU/
│   ├── DeadLock/
│   ├── Disk/
│   └── Memory/
│   └── App.jsx
│── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Sania-Singla/OS_Algo_Visualizer.git
cd OS_Algo_Visualizer
```

### 2️⃣ Install dependencies
```
npm i
```

### 3️⃣ Run the app
```
npm run dev
```

## How to Use
1. Select an algorithm from the menu
2. Input required parameters (e.g., burst time, arrival time)
3. Click Visualize / Start
4. Observe step-by-step execution
