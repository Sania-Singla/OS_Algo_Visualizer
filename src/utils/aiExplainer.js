export async function explainResult(algorithm, processes, result) {
    const prompt = `You are explaining an OS scheduling algorithm result to a student.
Algorithm: ${algorithm}
Processes: ${JSON.stringify(processes)}
Result: ${JSON.stringify(result)}

Explain in 3-4 simple sentences why the execution order happened this way.`;

    const response = await window.puter.ai.chat(prompt);
    return response.message.content;
}
