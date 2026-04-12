-- Clean Minimal Vape GUI - Exact Match to Requested Design
-- Full purple row when ON • Grey row when OFF • No toggles/pills • Independent columns

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TextChatService = game:GetService("TextChatService")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local lplr = Players.LocalPlayer
local autoToxicEnabled = false
local guiEnabled = true

-- ==================== CHAT ====================
local function sayInChat(message)
	pcall(function()
		local channel = TextChatService.ChatInputBarConfiguration.TargetTextChannel
		if channel then
			channel:SendAsync(message)
		end
	end)
end

-- ==================== FINAL KILL HOOK ====================
local function setupFinalKillHook()
	local KnitClient = ReplicatedStorage:FindFirstChild("Packages") 
		and ReplicatedStorage.Packages:FindFirstChild("Knit") 
		and ReplicatedStorage.Packages.Knit:FindFirstChild("Client")

	if not KnitClient then return end

	local controllersFolder = KnitClient:FindFirstChild("Controllers")
	if not controllersFolder then return end

	local CombatController = controllersFolder:FindFirstChild("CombatController")
	if CombatController then
		local controller = require(CombatController)
		local killSignal = controller.kill or controller.onKill or controller.KillEvent
		
		if killSignal and typeof(killSignal) == "Instance" then
			killSignal:Connect(function(victim, isFinalKill)
				if autoToxicEnabled and isFinalKill and victim ~= lplr then
					sayInChat("ez final kill 💀")
				end
			end)
		end
	end
end

setupFinalKillHook()

-- ==================== GUI ====================
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "VapeUtility"
screenGui.ResetOnSpawn = false
screenGui.Parent = lplr:WaitForChild("PlayerGui")

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 980, 0, 520)
mainFrame.Position = UDim2.new(0.5, -490, 0.5, -260)
mainFrame.BackgroundColor3 = Color3.fromRGB(19, 19, 19)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 12)

-- Top Bar
local topBar = Instance.new("Frame")
topBar.Size = UDim2.new(1, 0, 0, 48)
topBar.BackgroundColor3 = Color3.fromRGB(24, 24, 24)
topBar.BorderSizePixel = 0
topBar.Parent = mainFrame

Instance.new("UICorner", topBar).CornerRadius = UDim.new(0, 12)

local title = Instance.new("TextLabel")
title.Size = UDim2.new(0, 140, 1, 0)
title.Position = UDim2.new(0, 20, 0, 0)
title.BackgroundTransparency = 1
title.Text = "VAPE"
title.TextColor3 = Color3.fromRGB(180, 80, 255)
title.TextScaled = true
title.Font = Enum.Font.GothamBlack
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = topBar

-- Left Sidebar
local sidebar = Instance.new("Frame")
sidebar.Size = UDim2.new(0, 160, 1, -48)
sidebar.Position = UDim2.new(0, 0, 0, 48)
sidebar.BackgroundColor3 = Color3.fromRGB(22, 22, 22)
sidebar.BorderSizePixel = 0
sidebar.Parent = mainFrame

local sidebarLayout = Instance.new("UIListLayout")
sidebarLayout.SortOrder = Enum.SortOrder.LayoutOrder
sidebarLayout.Padding = UDim.new(0, 2)
sidebarLayout.Parent = sidebar

-- Content Area
local contentArea = Instance.new("Frame")
contentArea.Size = UDim2.new(1, -160, 1, -48)
contentArea.Position = UDim2.new(0, 160, 0, 48)
contentArea.BackgroundTransparency = 1
contentArea.Parent = mainFrame

local categories = {"Combat", "Blatant", "Render", "Utility", "World", "Legit"}
local columns = {}
local columnOrder = 0

-- Create Category + Column
local function createCategory(name)
	local defaultOpen = (name == "Utility")

	-- Sidebar Button
	local btn = Instance.new("TextButton")
	btn.Size = UDim2.new(1, 0, 0, 46)
	btn.BackgroundColor3 = defaultOpen and Color3.fromRGB(32, 32, 32) or Color3.fromRGB(22, 22, 22)
	btn.BorderSizePixel = 0
	btn.Text = "  " .. name
	btn.TextColor3 = Color3.fromRGB(220, 220, 220)
	btn.Font = Enum.Font.GothamSemibold
	btn.TextSize = 15
	btn.TextXAlignment = Enum.TextXAlignment.Left
	btn.Parent = sidebar

	local highlight = Instance.new("Frame")
	highlight.Name = "Highlight"
	highlight.Size = UDim2.new(0, 4, 1, 0)
	highlight.BackgroundColor3 = Color3.fromRGB(180, 80, 255)
	highlight.BorderSizePixel = 0
	highlight.Visible = defaultOpen
	highlight.Parent = btn

	-- Column
	local column = Instance.new("Frame")
	column.Name = name
	column.Size = UDim2.new(0, 230, 1, 0)
	column.Position = UDim2.new(0, columnOrder * 245, 0, 0)
	column.BackgroundColor3 = Color3.fromRGB(26, 26, 26)
	column.BorderSizePixel = 0
	column.Visible = defaultOpen
	column.Parent = contentArea

	Instance.new("UICorner", column).CornerRadius = UDim.new(0, 10)

	local colTitle = Instance.new("TextLabel")
	colTitle.Size = UDim2.new(1, 0, 0, 42)
	colTitle.BackgroundTransparency = 1
	colTitle.Text = name
	colTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
	colTitle.Font = Enum.Font.GothamBold
	colTitle.TextSize = 16
	colTitle.Parent = column

	columns[name] = column
	columnOrder += 1

	-- Click to toggle column
	btn.MouseButton1Click:Connect(function()
		column.Visible = not column.Visible
		highlight.Visible = column.Visible
		btn.BackgroundColor3 = column.Visible and Color3.fromRGB(32, 32, 32) or Color3.fromRGB(22, 22, 22)
	end)
end

for _, cat in ipairs(categories) do
	createCategory(cat)
end

-- ==================== MODULE (Rectangle Style - No Pill) ====================
local function createModule(parent, name, defaultEnabled)
	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(1, -16, 0, 58)
	frame.Position = UDim2.new(0, 8, 0, 52)
	frame.BackgroundColor3 = defaultEnabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
	frame.BorderSizePixel = 0
	frame.Parent = parent

	Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = name
	label.TextColor3 = Color3.fromRGB(255, 255, 255)
	label.Font = Enum.Font.GothamSemibold
	label.TextSize = 15
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = frame

	Instance.new("UIPadding", label).PaddingLeft = UDim.new(0, 18)

	local enabled = defaultEnabled

	local function updateVisual()
		if enabled then
			frame.BackgroundColor3 = Color3.fromRGB(140, 80, 255)
		else
			frame.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
		end
	end

	frame.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			enabled = not enabled
			updateVisual()
			
			if name == "AutoToxic" then
				autoToxicEnabled = enabled
			end
		end
	end)

	-- Hover effect
	frame.MouseEnter:Connect(function()
		if not enabled then
			TweenService:Create(frame, TweenInfo.new(0.15), {BackgroundColor3 = Color3.fromRGB(45, 45, 45)}):Play()
		end
	end)
	frame.MouseLeave:Connect(function()
		updateVisual()
	end)

	updateVisual()
end

createModule(columns["Utility"], "AutoToxic", false)

-- ==================== DRAGGING ====================
local function makeDraggable(frame, dragBar)
	local dragging = false
	local dragStart, startPos

	dragBar.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			dragging = true
			dragStart = input.Position
			startPos = frame.Position
		end
	end)

	dragBar.InputEnded:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			dragging = false
		end
	end)

	UserInputService.InputChanged:Connect(function(input)
		if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
			local delta = input.Position - dragStart
			frame.Position = UDim2.new(
				startPos.X.Scale,
				startPos.X.Offset + delta.X,
				startPos.Y.Scale,
				startPos.Y.Offset + delta.Y
			)
		end
	end)
end

makeDraggable(mainFrame, topBar)

for _, col in pairs(columns) do
	makeDraggable(col, col:FindFirstChildWhichIsA("TextLabel"))
end

-- ==================== KEYBIND ====================
UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then return end
	if input.KeyCode == Enum.KeyCode.RightShift then
		guiEnabled = not guiEnabled
		screenGui.Enabled = guiEnabled
	end
end)

print("VAPE GUI Loaded | RightShift to toggle")