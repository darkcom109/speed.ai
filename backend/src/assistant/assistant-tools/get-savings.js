import prisma from "#prisma/client.js";

export async function getSavings(userId) {
    const savings = await prisma.savingAccount.findMany({
        where: {
            userId: userId
        }
    })

    const parsedSavings = savings.length
        ? savings.map((saving, index) => `${index + 1}. ${saving.name} - ${saving.currentAmount}`).join("\n")
        : "You do not have any savings yet."
    
    return parsedSavings
}