import random

def rock_paper_scissors():
    print("欢迎来到人机猜拳游戏！")
    print("游戏规则：石头赢剪刀，剪刀赢布，布赢石头")
    print("输入 'q' 退出游戏\n")
    
    choices = ['石头', '剪刀', '布']
    user_score = 0
    computer_score = 0
    ties = 0
    
    while True:
        # 获取用户输入
        user_choice = input("请选择 (石头/剪刀/布) 或输入 'q' 退出: ").strip()
        
        if user_choice.lower() == 'q':
            break
            
        if user_choice not in choices:
            print("无效输入，请重新选择！\n")
            continue
        
        # 电脑随机选择
        computer_choice = random.choice(choices)
        print(f"电脑选择了: {computer_choice}")
        print(f"你选择了: {user_choice}")
        
        # 判断胜负
        if user_choice == computer_choice:
            print("平局！")
            ties += 1
        elif (user_choice == '石头' and computer_choice == '剪刀') or \
             (user_choice == '剪刀' and computer_choice == '布') or \
             (user_choice == '布' and computer_choice == '石头'):
            print("你赢了！")
            user_score += 1
        else:
            print("你输了！")
            computer_score += 1
        
        # 显示当前比分
        print(f"\n比分: 你 {user_score} - {computer_score} 电脑, 平局 {ties}\n")
    
    print(f"\n游戏结束！最终比分:")
    print(f"你: {user_score} 胜")
    print(f"电脑: {computer_score} 胜")
    print(f"平局: {ties} 次")
    
    if user_score > computer_score:
        print("恭喜你赢得了比赛！")
    elif computer_score > user_score:
        print("电脑赢得了比赛，再接再厉！")
    else:
        print("比赛平局，势均力敌！")

if __name__ == "__main__":
    rock_paper_scissors()