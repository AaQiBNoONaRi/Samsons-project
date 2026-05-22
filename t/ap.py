# class Animal:
#     def speak(self):
#         return "Some sound"

# class Dog(Animal):
#     def speak(self):
#         return "Woof!"

# # Example usage
# a = Animal()
# d = Dog()
# print(a.speak())  



class BankAccount:
    def __init__(self, balance):
        self.__balance = balance  # private variable

    def deposit(self, amount):
        self.__balance += amount

    def get_balance(self):
        return self.__balance

acc = BankAccount(1000)
acc.deposit(500)

print(acc._BankAccount__balance)  # ✅ Output: 1500



class Cat:
    def speak(self):
        return "Meow"

class Dog:
    def speak(self):
        return "Woof"

for animal in [Cat(), Dog()]:
    print(animal.speak())
