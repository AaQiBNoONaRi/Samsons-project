class Student:  
    school = "ABC School" 

    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def show(self):
        print(f"Student: {self.name}, Marks: {self.marks}, School: {self.school}")

s1= Student("Alice", 85)
s2= Student("Bob", 90)       

s1.show()
s2.show()
# stundets = []

# while True:
#     print("\n--- Student Menu ---")
#     print("1. Add Student")
#     print("2. Display Students")
#     print("3. Exit")
#     choice = input("Enter your choice: ")
#     if choice == '1':
#         name = input("Enter student name: ")
#         marks = input("Enter student marks: ")
#         student = Student(name, marks)
#         stundets.append(student)
#         print("Student added successfully!")
#     elif choice == '2':
#         if not stundets:
#             print("No students to display.")
#         else:
#             for student in stundets:
#                 student.show()
#     elif choice == '3':
#         print("Exiting the program.")
#         break
#     else:
#         print("Invalid choice. Please try again.")
