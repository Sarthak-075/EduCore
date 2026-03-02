import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create test teacher
  const hashedPassword = await bcrypt.hash("pass123", 10);
  
  const teacher = await prisma.teacher.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test Teacher",
      email: "test@example.com",
      phone: "+91-9876543210",
      passwordHash: hashedPassword,
    },
  });

  console.log(`Created/updated teacher: ${teacher.email}`);

  // Create test students
  const studentNames = [
    { name: "Neha Reddy", parent: "KV Reddy", phone: "+91-9111111111", fee: 5000 },
    { name: "Vikram Kumar", parent: "Rajesh Kumar", phone: "+91-9222222222", fee: 4500 },
    { name: "Ishita Desai", parent: "Priya Desai", phone: "+91-9333333333", fee: 4000 },
    { name: "Arjun Singh", parent: "Amit Singh", phone: "+91-9444444444", fee: 5500 },
    { name: "Zara Khan", parent: "Fatima Khan", phone: "+91-9555555555", fee: 4200 },
  ];

  const students = await Promise.all(
    studentNames.map((s) =>
      prisma.student.upsert({
        where: { id: s.name.replace(/\s+/g, "-").toLowerCase() },
        update: {
          name: s.name,
          parentName: s.parent,
          parentPhone: s.phone,
          monthlyFee: s.fee,
          dueDay: 5,
          isActive: true,
        },
        create: {
          id: s.name.replace(/\s+/g, "-").toLowerCase(),
          teacherId: teacher.id,
          name: s.name,
          parentName: s.parent,
          parentPhone: s.phone,
          monthlyFee: s.fee,
          dueDay: 5,
          isActive: true,
        },
      })
    )
  );

  console.log(`Created ${students.length} test students`);

  // Add payments for March 2026
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Neha Reddy - paid
  await prisma.payment.upsert({
    where: { id: "payment-neha-march" },
    update: {},
    create: {
      id: "payment-neha-march",
      studentId: students[0].id,
      month: currentMonth,
      year: currentYear,
      amountPaid: 5000,
      dateReceived: new Date(currentYear, currentMonth - 1, 1),
    },
  });

  // Vikram Kumar - partial payment
  await prisma.payment.upsert({
    where: { id: "payment-vikram-march" },
    update: {},
    create: {
      id: "payment-vikram-march",
      studentId: students[1].id,
      month: currentMonth,
      year: currentYear,
      amountPaid: 2250, // 50% payment
      dateReceived: new Date(currentYear, currentMonth - 1, 10),
    },
  });

  // Ishita Desai - paid
  await prisma.payment.upsert({
    where: { id: "payment-ishita-march" },
    update: {},
    create: {
      id: "payment-ishita-march",
      studentId: students[2].id,
      month: currentMonth,
      year: currentYear,
      amountPaid: 4000,
      dateReceived: new Date(currentYear, currentMonth - 1, 3),
    },
  });

  // Arjun Singh - no payment (pending)
  // Zara Khan - paid
  await prisma.payment.upsert({
    where: { id: "payment-zara-march" },
    update: {},
    create: {
      id: "payment-zara-march",
      studentId: students[4].id,
      month: currentMonth,
      year: currentYear,
      amountPaid: 4200,
      dateReceived: new Date(currentYear, currentMonth - 1, 5),
    },
  });

  console.log("Test data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
