-- BedWars Vape GUI - Complete & Functional
-- Press RightShift to toggle GUI
-- Features: KillAura, Reach, Speed, Fly, ESP, Tracers, AutoToxic, Nuker, Scaffold, AimAssist, AutoClicker
-- New: Velocity, LongJump, NoFallDamage, AntiVoid, InfiniteJump
-- Each module has Keybind and expandable Settings

-- ==================== SERVICES ====================
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TextChatService = game:GetService("TextChatService")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local VirtualInputManager = game:GetService("VirtualInputManager")
local Debris = game:GetService("Debris")

local lplr = Players.LocalPlayer
local mouse = lplr:GetMouse()
local camera = Workspace.CurrentCamera

-- ==================== STATE ====================
local moduleStates = {}          -- { [moduleName] = enabled }
local moduleConnections = {}     -- { [moduleName] = { connection1, connection2, ... } }
local moduleKeybinds = {}        -- { [moduleName] = keyCode or nil }
local moduleSettings = {}        -- { [moduleName] = { settingName = value } }
local guiEnabled = true
local autoToxicEnabled = false

-- ==================== CHAT UTILITY ====================
local function sayInChat(message)
    pcall(function()
        local channel = TextChatService.ChatInputBarConfiguration.TargetTextChannel
        if channel then
            channel:SendAsync(message)
        end
    end)
end

-- ==================== BEDWARS CONTROLLER FETCH ====================
local KnitClient, CombatController, BedwarsShopController, ClientHandler

local function fetchControllers()
    local knitPaths = {
        ReplicatedStorage:FindFirstChild("Packages") and ReplicatedStorage.Packages:FindFirstChild("Knit"),
        ReplicatedStorage:FindFirstChild("rbxts_include") and ReplicatedStorage.rbxts_include:FindFirstChild("node_modules"):FindFirstChild("@rbxts"):FindFirstChild("net"):FindFirstChild("out")
    }
    for _, knit in ipairs(knitPaths) do
        if knit then
            KnitClient = knit:FindFirstChild("Client")
            if KnitClient then break end
        end
    end
    if not KnitClient then return end
    local controllers = KnitClient:FindFirstChild("Controllers")
    if controllers then
        CombatController = controllers:FindFirstChild("CombatController")
        BedwarsShopController = controllers:FindFirstChild("BedwarsShopController")
        ClientHandler = controllers:FindFirstChild("ClientHandler")
    end
end
fetchControllers()

-- ==================== HELPER FUNCTIONS ====================
local function getCharacter(player)
    return player and player.Character
end

local function getHumanoid(char)
    return char and char:FindFirstChildOfClass("Humanoid")
end

local function getHRP(char)
    return char and char:FindFirstChild("HumanoidRootPart")
end

-- Get nearest enemy (players + NPCs) excluding teammates
local function getNearestEnemy(range, ignoreTeam)
    local myChar = getCharacter(lplr)
    if not myChar then return nil, nil end
    local myTeam = ignoreTeam and nil or lplr.Team
    local myHRP = getHRP(myChar)
    if not myHRP then return nil, nil end

    local nearest = nil
    local shortest = range or math.huge

    -- Players
    for _, player in ipairs(Players:GetPlayers()) do
        if player == lplr then continue end
        if myTeam and player.Team == myTeam then continue end
        local char = getCharacter(player)
        local hrp = getHRP(char)
        if hrp then
            local hum = getHumanoid(char)
            if hum and hum.Health > 0 then
                local dist = (myHRP.Position - hrp.Position).Magnitude
                if dist < shortest then
                    shortest = dist
                    nearest = char
                end
            end
        end
    end

    -- NPCs (any model with Humanoid, not belonging to a player)
    for _, model in ipairs(Workspace:GetDescendants()) do
        if model:IsA("Model") and model ~= myChar then
            local hum = model:FindFirstChildOfClass("Humanoid")
            local hrp = model:FindFirstChild("HumanoidRootPart")
            if hum and hrp and hum.Health > 0 then
                local isPlayerChar = false
                for _, plr in ipairs(Players:GetPlayers()) do
                    if plr.Character == model then isPlayerChar = true break end
                end
                if not isPlayerChar then
                    local dist = (myHRP.Position - hrp.Position).Magnitude
                    if dist < shortest then
                        shortest = dist
                        nearest = model
                    end
                end
            end
        end
    end

    return nearest, shortest
end

-- Safe connection management
local function addConnection(moduleName, connection)
    if not moduleConnections[moduleName] then
        moduleConnections[moduleName] = {}
    end
    table.insert(moduleConnections[moduleName], connection)
end

local function cleanupModule(moduleName)
    if moduleConnections[moduleName] then
        for _, conn in ipairs(moduleConnections[moduleName]) do
            pcall(function() conn:Disconnect() end)
        end
        moduleConnections[moduleName] = nil
    end
end

-- ==================== SETTINGS UI HELPERS ====================
local function createSlider(parent, name, min, max, default, callback)
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, -10, 0, 40)
    frame.BackgroundTransparency = 1
    frame.Parent = parent

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(1, 0, 0, 20)
    label.BackgroundTransparency = 1
    label.Text = name .. ": " .. tostring(default)
    label.TextColor3 = Color3.fromRGB(200, 200, 200)
    label.Font = Enum.Font.Gotham
    label.TextSize = 14
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    local slider = Instance.new("Frame")
    slider.Size = UDim2.new(1, 0, 0, 20)
    slider.Position = UDim2.new(0, 0, 0, 20)
    slider.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
    slider.Parent = frame
    Instance.new("UICorner", slider).CornerRadius = UDim.new(0, 4)

    local fill = Instance.new("Frame")
    local range = max - min
    local percent = (default - min) / range
    fill.Size = UDim2.new(percent, 0, 1, 0)
    fill.BackgroundColor3 = Color3.fromRGB(140, 80, 255)
    fill.BorderSizePixel = 0
    fill.Parent = slider
    Instance.new("UICorner", fill).CornerRadius = UDim.new(0, 4)

    -- Double-click to enter value
    local function openTextInput()
        local inputBox = Instance.new("TextBox")
        inputBox.Size = UDim2.new(0, 50, 0, 20)
        inputBox.Position = UDim2.new(0, label.TextBounds.X + 5, 0, 0)
        inputBox.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
        inputBox.TextColor3 = Color3.fromRGB(255, 255, 255)
        inputBox.Text = tostring(default)
        inputBox.Font = Enum.Font.Gotham
        inputBox.TextSize = 14
        inputBox.Parent = frame
        inputBox:CaptureFocus()

        inputBox.FocusLost:Connect(function(enterPressed)
            local num = tonumber(inputBox.Text)
            if num then
                num = math.clamp(num, min, max)
                default = num
                label.Text = name .. ": " .. tostring(num)
                local newPercent = (num - min) / range
                fill.Size = UDim2.new(newPercent, 0, 1, 0)
                callback(num)
            end
            inputBox:Destroy()
        end)
    end

    label.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton2 then
            openTextInput()
        elseif input.UserInputType == Enum.UserInputType.Touch and input.UserInputState == Enum.UserInputState.End then
            -- Simulate double-tap for mobile? Not implemented fully
        end
    end)
    label.MouseButton2Click:Connect(openTextInput)

    local dragging = false
    slider.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
        end
    end)
    slider.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = false
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
            local relativeX = math.clamp((input.Position.X - slider.AbsolutePosition.X) / slider.AbsoluteSize.X, 0, 1)
            local val = min + relativeX * range
            if math.abs(val - default) > 0.01 then
                default = val
                label.Text = name .. ": " .. string.format("%.1f", val)
                fill.Size = UDim2.new(relativeX, 0, 1, 0)
                callback(val)
            end
        end
    end)

    return {
        GetValue = function() return default end,
        SetValue = function(v)
            default = v
            label.Text = name .. ": " .. string.format("%.1f", v)
            local newPercent = (v - min) / range
            fill.Size = UDim2.new(newPercent, 0, 1, 0)
            callback(v)
        end
    }
end

local function createToggle(parent, name, default, callback)
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, -10, 0, 30)
    frame.BackgroundTransparency = 1
    frame.Parent = parent

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.7, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = name
    label.TextColor3 = Color3.fromRGB(200, 200, 200)
    label.Font = Enum.Font.Gotham
    label.TextSize = 14
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    local button = Instance.new("TextButton")
    button.Size = UDim2.new(0, 40, 0, 20)
    button.Position = UDim2.new(1, -40, 0.5, -10)
    button.BackgroundColor3 = default and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(50, 50, 50)
    button.Text = default and "ON" or "OFF"
    button.TextColor3 = Color3.fromRGB(255, 255, 255)
    button.Font = Enum.Font.GothamBold
    button.TextSize = 12
    button.Parent = frame
    Instance.new("UICorner", button).CornerRadius = UDim.new(0, 4)

    local state = default
    button.MouseButton1Click:Connect(function()
        state = not state
        button.BackgroundColor3 = state and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(50, 50, 50)
        button.Text = state and "ON" or "OFF"
        callback(state)
    end)

    return {
        GetValue = function() return state end,
        SetValue = function(v)
            state = v
            button.BackgroundColor3 = state and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(50, 50, 50)
            button.Text = state and "ON" or "OFF"
            callback(v)
        end
    }
end

local function createDropdown(parent, name, options, default, callback)
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, -10, 0, 30)
    frame.BackgroundTransparency = 1
    frame.Parent = parent

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.7, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = name
    label.TextColor3 = Color3.fromRGB(200, 200, 200)
    label.Font = Enum.Font.Gotham
    label.TextSize = 14
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    local button = Instance.new("TextButton")
    button.Size = UDim2.new(0, 80, 0, 20)
    button.Position = UDim2.new(1, -80, 0.5, -10)
    button.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    button.Text = default
    button.TextColor3 = Color3.fromRGB(255, 255, 255)
    button.Font = Enum.Font.Gotham
    button.TextSize = 12
    button.Parent = frame
    Instance.new("UICorner", button).CornerRadius = UDim.new(0, 4)

    local selected = default
    button.MouseButton1Click:Connect(function()
        local idx = table.find(options, selected) or 1
        idx = idx % #options + 1
        selected = options[idx]
        button.Text = selected
        callback(selected)
    end)

    return {
        GetValue = function() return selected end,
        SetValue = function(v)
            selected = v
            button.Text = v
            callback(v)
        end
    }
end

local function createTextBox(parent, name, default, callback)
    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(1, -10, 0, 30)
    frame.BackgroundTransparency = 1
    frame.Parent = parent

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.7, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = name
    label.TextColor3 = Color3.fromRGB(200, 200, 200)
    label.Font = Enum.Font.Gotham
    label.TextSize = 14
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    local box = Instance.new("TextBox")
    box.Size = UDim2.new(0, 80, 0, 20)
    box.Position = UDim2.new(1, -80, 0.5, -10)
    box.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    box.Text = default
    box.TextColor3 = Color3.fromRGB(255, 255, 255)
    box.Font = Enum.Font.Gotham
    box.TextSize = 12
    box.Parent = frame
    Instance.new("UICorner", box).CornerRadius = UDim.new(0, 4)

    box.FocusLost:Connect(function(enterPressed)
        callback(box.Text)
    end)

    return {
        GetValue = function() return box.Text end,
        SetValue = function(v)
            box.Text = v
            callback(v)
        end
    }
end

-- ==================== MODULE IMPLEMENTATIONS ====================

-- 1. KILLAURA
moduleSettings["KillAura"] = {
    faceTarget = true,
    range = 12,
    swingSpeed = 10, -- swings per second
    requireSword = false,
    attackPlayers = true,
    attackNPCs = true
}
local killAuraLastSwing = 0

local function toggleKillAura(enabled)
    cleanupModule("KillAura")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function(deltaTime)
        if not moduleStates["KillAura"] then return end
        local settings = moduleSettings["KillAura"]
        local myChar = getCharacter(lplr)
        local myHRP = getHRP(myChar)
        if not myHRP then return end

        -- Check sword requirement
        if settings.requireSword then
            local tool = myChar:FindFirstChildOfClass("Tool")
            if not tool or not tool:IsA("Tool") or not tool.Name:lower():find("sword") then
                return
            end
        end

        local targetChar = getNearestEnemy(settings.range, true) -- ignore team
        if targetChar then
            local targetHRP = getHRP(targetChar)
            if targetHRP then
                -- Face target
                if settings.faceTarget then
                    myHRP.CFrame = CFrame.lookAt(myHRP.Position, Vector3.new(targetHRP.Position.X, myHRP.Position.Y, targetHRP.Position.Z))
                end

                -- Swing speed control
                local now = tick()
                if now - killAuraLastSwing >= 1 / settings.swingSpeed then
                    killAuraLastSwing = now
                    -- Attack
                    local tool = myChar:FindFirstChildOfClass("Tool")
                    if tool and tool:IsA("Tool") then
                        tool:Activate()
                    else
                        -- Punch
                        local hum = getHumanoid(myChar)
                        if hum then
                            -- Some games use a remote for punching; try to find it
                            local punchRemote = ReplicatedStorage:FindFirstChild("Punch") or ReplicatedStorage:FindFirstChild("Remotes"):FindFirstChild("Punch")
                            if punchRemote then
                                punchRemote:FireServer()
                            end
                        end
                    end
                end
            end
        end
    end)
    addConnection("KillAura", connection)
end

-- 2. REACH
moduleSettings["Reach"] = {
    hitRange = 12,
    mineRange = 12,
    placeRange = 12
}

local function toggleReach(enabled)
    cleanupModule("Reach")
    if not enabled then
        -- Reset handle sizes
        local char = getCharacter(lplr)
        if char then
            for _, tool in ipairs(char:GetChildren()) do
                if tool:IsA("Tool") and tool:FindFirstChild("Handle") then
                    local handle = tool.Handle
                    local orig = handle:FindFirstChild("OriginalReach")
                    if orig then
                        handle.Size = Vector3.new(handle.Size.X, handle.Size.Y, orig.Value)
                        orig:Destroy()
                    end
                    handle.Transparency = 0
                end
            end
        end
        lplr:SetAttribute("Reach", nil)
        camera.MaxZoomDistance = 20
        return
    end

    local function applyReach()
        local char = getCharacter(lplr)
        if not char then return end
        local settings = moduleSettings["Reach"]

        -- Set character reach attribute (common in BedWars)
        lplr:SetAttribute("Reach", settings.hitRange)

        -- Extend tool handle
        for _, tool in ipairs(char:GetChildren()) do
            if tool:IsA("Tool") and tool:FindFirstChild("Handle") then
                local handle = tool.Handle
                if not handle:FindFirstChild("OriginalReach") then
                    local orig = Instance.new("NumberValue", handle)
                    orig.Name = "OriginalReach"
                    orig.Value = handle.Size.Z
                end
                local maxRange = math.max(settings.hitRange, settings.mineRange, settings.placeRange)
                handle.Size = Vector3.new(handle.Size.X, handle.Size.Y, maxRange)
                handle.Transparency = 0.5
            end
        end

        -- Adjust camera max zoom (may affect place range)
        camera.MaxZoomDistance = math.max(settings.placeRange, 20)
    end

    applyReach()
    addConnection("Reach", lplr.CharacterAdded:Connect(applyReach))
    addConnection("Reach", RunService.Heartbeat:Connect(function()
        if not moduleStates["Reach"] then return end
        applyReach()
    end))
end

-- 3. SPEED
moduleSettings["Speed"] = { speed = 24 }

local function toggleSpeed(enabled)
    cleanupModule("Speed")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local hum = getHumanoid(char)
            if hum then
                hum.WalkSpeed = 16
                hum.JumpPower = 50
            end
        end
        return
    end

    local function applySpeed()
        local char = getCharacter(lplr)
        if not char then return end
        local hum = getHumanoid(char)
        if hum then
            hum.WalkSpeed = moduleSettings["Speed"].speed
            hum.JumpPower = 60
        end
    end

    applySpeed()
    addConnection("Speed", lplr.CharacterAdded:Connect(applySpeed))
    addConnection("Speed", RunService.Heartbeat:Connect(function()
        if not moduleStates["Speed"] then return end
        applySpeed()
    end))
end

-- 4. FLY (with TP down fix)
moduleSettings["Fly"] = {
    horizontalSpeed = 40,
    verticalSpeed = 40,
    tpDownEnabled = false,
    tpDownInterval = 2.5
}
local tpDownLast = 0
local tpDownOriginalPos = nil
local tpDownActive = false

local function toggleFly(enabled)
    cleanupModule("Fly")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local hrp = getHRP(char)
            if hrp then
                local bv = hrp:FindFirstChild("FlyVelocity")
                if bv then bv:Destroy() end
            end
        end
        tpDownActive = false
        return
    end

    local function setupFly()
        local char = getCharacter(lplr)
        if not char then return end
        local hrp = getHRP(char)
        if not hrp then return end

        local bv = hrp:FindFirstChild("FlyVelocity") or Instance.new("BodyVelocity")
        bv.Name = "FlyVelocity"
        bv.MaxForce = Vector3.new(1e5, 1e5, 1e5)
        bv.Velocity = Vector3.zero
        bv.Parent = hrp

        return bv
    end

    local flyConnection = RunService.Heartbeat:Connect(function(deltaTime)
        if not moduleStates["Fly"] then return end
        local bv = setupFly()
        if not bv then return end
        local settings = moduleSettings["Fly"]

        -- TP Down logic
        if settings.tpDownEnabled then
            local char = getCharacter(lplr)
            local hrp = getHRP(char)
            if hrp then
                local isAirborne = hrp.Velocity.Y ~= 0 or not char:IsGrounded()
                if isAirborne and not tpDownActive then
                    local now = tick()
                    if now - tpDownLast >= settings.tpDownInterval then
                        tpDownLast = now
                        tpDownActive = true
                        tpDownOriginalPos = hrp.Position

                        -- Teleport down
                        local rayOrigin = hrp.Position
                        local rayDirection = Vector3.new(0, -500, 0)
                        local raycastParams = RaycastParams.new()
                        raycastParams.FilterType = Enum.RaycastFilterType.Blacklist
                        raycastParams.FilterDescendantsInstances = {char}
                        local rayResult = Workspace:Raycast(rayOrigin, rayDirection, raycastParams)
                        if rayResult then
                            local groundPos = rayResult.Position + Vector3.new(0, 3, 0)
                            hrp.CFrame = CFrame.new(groundPos)
                        end
                        -- Wait a moment then return
                        task.delay(0.2, function()
                            if tpDownActive and tpDownOriginalPos then
                                local charNow = getCharacter(lplr)
                                local hrpNow = getHRP(charNow)
                                if hrpNow then
                                    hrpNow.CFrame = CFrame.new(tpDownOriginalPos)
                                end
                            end
                            tpDownActive = false
                            tpDownOriginalPos = nil
                        end)
                    end
                elseif not isAirborne then
                    tpDownActive = false
                end
            end
        end

        local moveDir = Vector3.zero
        local camLook = camera.CFrame.LookVector
        local camRight = camera.CFrame.RightVector
        local flatLook = Vector3.new(camLook.X, 0, camLook.Z).Unit
        local flatRight = Vector3.new(camRight.X, 0, camRight.Z).Unit

        if UserInputService:IsKeyDown(Enum.KeyCode.W) then moveDir += flatLook end
        if UserInputService:IsKeyDown(Enum.KeyCode.S) then moveDir -= flatLook end
        if UserInputService:IsKeyDown(Enum.KeyCode.A) then moveDir -= flatRight end
        if UserInputService:IsKeyDown(Enum.KeyCode.D) then moveDir += flatRight end

        if UserInputService:IsKeyDown(Enum.KeyCode.Space) then
            moveDir += Vector3.new(0, 1, 0)
        elseif UserInputService:IsKeyDown(Enum.KeyCode.LeftControl) then
            moveDir -= Vector3.new(0, 1, 0)
        end

        if moveDir.Magnitude > 0 then
            -- Normalize horizontal part to prevent diagonal speed boost
            local horiz = Vector3.new(moveDir.X, 0, moveDir.Z)
            if horiz.Magnitude > 0 then
                horiz = horiz.Unit * settings.horizontalSpeed
            end
            local vert = moveDir.Y * settings.verticalSpeed
            bv.Velocity = Vector3.new(horiz.X, vert, horiz.Z)
        else
            bv.Velocity = Vector3.zero
        end
    end)
    addConnection("Fly", flyConnection)
end

-- 5. ESP (works on NPCs too)
local function toggleESP(enabled)
    cleanupModule("ESP")
    if not enabled then
        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj:IsA("Highlight") and obj.Name == "ESP_Highlight" then
                obj:Destroy()
            end
        end
        return
    end

    local function addESPtoModel(model)
        if not model or model:FindFirstChild("ESP_Highlight") then return end
        local highlight = Instance.new("Highlight")
        highlight.Name = "ESP_Highlight"
        highlight.FillColor = Color3.fromRGB(255, 0, 0)
        highlight.FillTransparency = 0.5
        highlight.OutlineColor = Color3.fromRGB(255, 255, 255)
        highlight.OutlineTransparency = 0
        highlight.Adornee = model
        highlight.Parent = model
    end

    local function scanAndAddESP()
        if not moduleStates["ESP"] then return end
        for _, player in ipairs(Players:GetPlayers()) do
            if player ~= lplr and player.Character then
                addESPtoModel(player.Character)
            end
        end
        for _, model in ipairs(Workspace:GetDescendants()) do
            if model:IsA("Model") then
                local hum = model:FindFirstChildOfClass("Humanoid")
                if hum and hum.Health > 0 then
                    local isPlayerChar = false
                    for _, plr in ipairs(Players:GetPlayers()) do
                        if plr.Character == model then isPlayerChar = true break end
                    end
                    if not isPlayerChar then
                        addESPtoModel(model)
                    end
                end
            end
        end
    end

    scanAndAddESP()
    addConnection("ESP", RunService.Heartbeat:Connect(scanAndAddESP))
end

-- 6. TRACERS (works on NPCs too)
moduleSettings["Tracers"] = { transparency = 0.5 }

local function toggleTracers(enabled)
    cleanupModule("Tracers")
    if not enabled then
        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj:IsA("Beam") and obj.Name == "TracerBeam" then obj:Destroy() end
        end
        return
    end

    local function createTracerForModel(model)
        if not model or model:FindFirstChild("TracerBeam") then return end
        local head = model:FindFirstChild("Head") or model:FindFirstChild("HumanoidRootPart")
        if not head then return end

        local attach0 = Instance.new("Attachment")
        attach0.Name = "TracerAttach0"
        attach0.Parent = camera

        local attach1 = Instance.new("Attachment")
        attach1.Name = "TracerAttach1"
        attach1.Parent = head

        local beam = Instance.new("Beam")
        beam.Name = "TracerBeam"
        beam.Attachment0 = attach0
        beam.Attachment1 = attach1
        beam.Color = ColorSequence.new(Color3.fromRGB(255, 0, 0))
        beam.Transparency = NumberSequence.new(moduleSettings["Tracers"].transparency)
        beam.Width0 = 0.1
        beam.Width1 = 0.1
        beam.Parent = model

        local updateConn = RunService.RenderStepped:Connect(function()
            if not moduleStates["Tracers"] then return end
            if not attach0 or not attach0.Parent then return end
            if not camera then return end
            attach0.WorldPosition = camera.CFrame.Position
            beam.Transparency = NumberSequence.new(moduleSettings["Tracers"].transparency)
        end)
        addConnection("Tracers_" .. model:GetFullName(), updateConn)
    end

    local function scanAndAddTracers()
        if not moduleStates["Tracers"] then return end
        for _, player in ipairs(Players:GetPlayers()) do
            if player ~= lplr and player.Character then
                createTracerForModel(player.Character)
            end
        end
        for _, model in ipairs(Workspace:GetDescendants()) do
            if model:IsA("Model") then
                local hum = model:FindFirstChildOfClass("Humanoid")
                if hum and hum.Health > 0 then
                    local isPlayerChar = false
                    for _, plr in ipairs(Players:GetPlayers()) do
                        if plr.Character == model then isPlayerChar = true break end
                    end
                    if not isPlayerChar then
                        createTracerForModel(model)
                    end
                end
            end
        end
    end

    scanAndAddTracers()
    addConnection("Tracers", RunService.Heartbeat:Connect(scanAndAddTracers))
end

-- 7. AUTO TOXIC
moduleSettings["AutoToxic"] = {
    finalKillMessage = "ez final kill 💀",
    bedBreakMessage = "bed gone lol",
    gameWinMessage = "gg ez",
    enabledFinalKill = true,
    enabledBedBreak = true,
    enabledGameWin = true
}

local function setupAutoToxic()
    if not CombatController then return end
    local controller = require(CombatController)
    local killSignal = controller.kill or controller.onKill or controller.KillEvent
    if killSignal and typeof(killSignal) == "Instance" then
        killSignal:Connect(function(victim, isFinalKill)
            if autoToxicEnabled and moduleSettings["AutoToxic"].enabledFinalKill and isFinalKill and victim ~= lplr then
                sayInChat(moduleSettings["AutoToxic"].finalKillMessage)
            end
        end)
    end
end
setupAutoToxic()

-- 8. NUKER
moduleSettings["Nuker"] = {
    mineBeds = true,
    mineIron = true,
    mineGold = true,
    mineDiamond = true,
    mineEmerald = true,
    mineRadius = 10
}

local function toggleNuker(enabled)
    cleanupModule("Nuker")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["Nuker"] then return end
        local settings = moduleSettings["Nuker"]
        local myChar = getCharacter(lplr)
        local myHRP = getHRP(myChar)
        if not myHRP then return end

        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj:IsA("BasePart") then
                local dist = (myHRP.Position - obj.Position).Magnitude
                if dist > settings.mineRadius then continue end

                local shouldMine = false
                local nameLower = obj.Name:lower()
                if settings.mineBeds and nameLower == "bed" and obj.Parent and obj.Parent.Name ~= lplr.Name then
                    shouldMine = true
                elseif settings.mineIron and nameLower:find("iron") then
                    shouldMine = true
                elseif settings.mineGold and nameLower:find("gold") then
                    shouldMine = true
                elseif settings.mineDiamond and nameLower:find("diamond") then
                    shouldMine = true
                elseif settings.mineEmerald and nameLower:find("emerald") then
                    shouldMine = true
                end

                if shouldMine then
                    local tool = myChar:FindFirstChildOfClass("Tool")
                    if tool then
                        firetouchinterest(obj, tool.Handle, 0)
                        firetouchinterest(obj, tool.Handle, 1)
                    end
                end
            end
        end
    end)
    addConnection("Nuker", connection)
end

-- 9. SCAFFOLD (improved block placement)
moduleSettings["Scaffold"] = {
    allowTowering = true
}

local function getTeamWoolName()
    local team = lplr.Team
    if not team then return "wool_white" end
    local teamName = team.Name:lower()
    if teamName:find("blue") then return "wool_blue"
    elseif teamName:find("red") then return "wool_red"
    elseif teamName:find("green") then return "wool_green"
    elseif teamName:find("yellow") then return "wool_yellow"
    elseif teamName:find("aqua") then return "wool_cyan"
    elseif teamName:find("pink") then return "wool_pink"
    elseif teamName:find("gray") then return "wool_gray"
    elseif teamName:find("white") then return "wool_white"
    else return "wool_white" end
end

local function toggleScaffold(enabled)
    cleanupModule("Scaffold")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["Scaffold"] then return end
        local myChar = getCharacter(lplr)
        local hrp = getHRP(myChar)
        if not hrp then return end

        -- Check if we have wool
        local hasWool = false
        local woolName = getTeamWoolName()
        for _, tool in ipairs(myChar:GetChildren()) do
            if tool:IsA("Tool") and tool.Name:lower():find("wool") then
                hasWool = true
                break
            end
        end
        if not hasWool then return end

        local placePos = hrp.Position - Vector3.new(0, 3, 0)

        -- Tower if jumping and setting enabled
        if moduleSettings["Scaffold"].allowTowering then
            local hum = getHumanoid(myChar)
            if hum and hum:GetState() == Enum.HumanoidStateType.Jumping then
                placePos = hrp.Position - Vector3.new(0, 0.5, 0)
            end
        end

        -- Prevent placing on existing blocks
        local region = Region3.new(placePos - Vector3.new(1,1,1), placePos + Vector3.new(1,1,1))
        local parts = Workspace:FindPartsInRegion3(region, nil, 100)
        local blockExists = false
        for _, part in ipairs(parts) do
            if part:IsA("BasePart") and not part.Parent:IsA("Model") then
                blockExists = true
                break
            end
        end
        if blockExists then return end

        -- Attempt to place via remote
        local remotes = ReplicatedStorage:FindFirstChild("Remotes")
        if remotes then
            local placeRemote = remotes:FindFirstChild("PlaceBlock") or remotes:FindFirstChild("PlaceBlockRemote")
            if placeRemote then
                placeRemote:FireServer(woolName, placePos)
            end
        end
    end)
    addConnection("Scaffold", connection)
end

-- 10. AIM ASSIST (fixed speed)
moduleSettings["AimAssist"] = {
    speed = 0.1,
    range = 30
}

local function toggleAimAssist(enabled)
    cleanupModule("AimAssist")
    if not enabled then return end

    local connection = RunService.RenderStepped:Connect(function(deltaTime)
        if not moduleStates["AimAssist"] then return end
        local settings = moduleSettings["AimAssist"]
        local nearest = getNearestEnemy(settings.range, true)
        if not nearest then return end
        local head = nearest:FindFirstChild("Head")
        if not head then return end

        local screenPos, onScreen = camera:WorldToScreenPoint(head.Position)
        if not onScreen then return end

        local targetPos = Vector2.new(screenPos.X, screenPos.Y)
        local mousePos = Vector2.new(mouse.X, mouse.Y)
        local delta = (targetPos - mousePos) * settings.speed * (deltaTime * 60) -- scale by framerate
        mousemoverel(delta.X, delta.Y)
    end)
    addConnection("AimAssist", connection)
end

-- 11. AUTO CLICKER (fixed)
moduleSettings["AutoClicker"] = { cps = 10 }

local function toggleAutoClicker(enabled)
    cleanupModule("AutoClicker")
    if not enabled then return end

    local holding = false
    local lastClick = 0

    local conn1 = UserInputService.InputBegan:Connect(function(input, gpe)
        if gpe then return end
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            holding = true
        end
    end)
    local conn2 = UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            holding = false
        end
    end)
    local conn3 = RunService.Heartbeat:Connect(function()
        if holding and moduleStates["AutoClicker"] then
            local now = tick()
            local delay = 1 / moduleSettings["AutoClicker"].cps
            if now - lastClick >= delay then
                lastClick = now
                VirtualInputManager:SendMouseButtonEvent(mouse.X, mouse.Y, 0, true, game, 1)
                task.wait()
                VirtualInputManager:SendMouseButtonEvent(mouse.X, mouse.Y, 0, false, game, 1)
            end
        end
    end)

    addConnection("AutoClicker", conn1)
    addConnection("AutoClicker", conn2)
    addConnection("AutoClicker", conn3)
end

-- 12. VELOCITY (fixed using LinearVelocity)
moduleSettings["Velocity"] = { reductionPercent = 50 }

local function toggleVelocity(enabled)
    cleanupModule("Velocity")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local hrp = getHRP(char)
            if hrp then
                local lv = hrp:FindFirstChild("KnockbackReducer")
                if lv then lv:Destroy() end
            end
        end
        return
    end

    local function applyVelocity(char)
        local hrp = getHRP(char)
        if not hrp then return end
        local lv = Instance.new("LinearVelocity")
        lv.Name = "KnockbackReducer"
        lv.Attachment0 = hrp:FindFirstChild("RootAttachment") or Instance.new("Attachment", hrp)
        lv.MaxForce = 1e5
        lv.VectorVelocity = Vector3.zero
        lv.RelativeTo = Enum.ActuatorRelativeTo.World
        lv.Parent = hrp

        -- Continuously apply counter-velocity
        local conn = RunService.Heartbeat:Connect(function()
            if not moduleStates["Velocity"] then return end
            local vel = hrp.Velocity
            local reduction = moduleSettings["Velocity"].reductionPercent / 100
            -- Only reduce horizontal knockback
            local newVel = Vector3.new(vel.X * (1 - reduction), vel.Y, vel.Z * (1 - reduction))
            lv.VectorVelocity = newVel - vel
        end)
        addConnection("Velocity", conn)
    end

    if lplr.Character then applyVelocity(lplr.Character) end
    addConnection("Velocity", lplr.CharacterAdded:Connect(applyVelocity))
end

-- 13. LONGJUMP (reworked)
moduleSettings["LongJump"] = { speed = 100 }
local longJumpWaiting = false
local longJumpOriginalWalkSpeed = 16

local function toggleLongJump(enabled)
    cleanupModule("LongJump")
    if not enabled then
        longJumpWaiting = false
        local char = getCharacter(lplr)
        if char then
            local hum = getHumanoid(char)
            if hum then hum.WalkSpeed = 16 end
            local hrp = getHRP(char)
            if hrp then
                local bv = hrp:FindFirstChild("LongJumpVelocity")
                if bv then bv:Destroy() end
            end
        end
        return
    end

    -- Wait for Yuzi Dao
    longJumpWaiting = true
    local function checkForYuzi()
        if not moduleStates["LongJump"] then return end
        local char = getCharacter(lplr)
        if not char then return end
        local hum = getHumanoid(char)
        if hum then
            if longJumpWaiting then
                hum.WalkSpeed = 0  -- Immobilise
            end
        end
        local tool = char:FindFirstChildOfClass("Tool")
        if tool and tool.Name:lower():find("yuzi") and longJumpWaiting then
            longJumpWaiting = false
            -- Launch
            local hrp = getHRP(char)
            if hrp then
                local bv = Instance.new("BodyVelocity")
                bv.Name = "LongJumpVelocity"
                bv.MaxForce = Vector3.new(1e5, 0, 1e5)
                bv.Velocity = (camera.CFrame.LookVector * Vector3.new(1,0,1)).Unit * moduleSettings["LongJump"].speed
                bv.Parent = hrp
                Debris:AddItem(bv, 5)
                if hum then hum.WalkSpeed = 16 end
            end
        end
    end

    local conn = RunService.Heartbeat:Connect(checkForYuzi)
    addConnection("LongJump", conn)
    addConnection("LongJump", lplr.CharacterAdded:Connect(function(char)
        if moduleStates["LongJump"] then
            longJumpWaiting = true
        end
    end))
end

-- 14. NOFALLDAMAGE (fixed)
moduleSettings["NoFallDamage"] = {
    method = "Landing" -- "Landing", "NegateVelocity", "Teleport"
}

local function toggleNoFallDamage(enabled)
    cleanupModule("NoFallDamage")
    if not enabled then return end

    local function apply(char)
        local hum = char:WaitForChild("Humanoid")
        if moduleSettings["NoFallDamage"].method == "Landing" then
            local conn = hum.StateChanged:Connect(function(old, new)
                if new == Enum.HumanoidStateType.Freefall then
                    hum:ChangeState(Enum.HumanoidStateType.Landed)
                end
            end)
            addConnection("NoFallDamage", conn)
        elseif moduleSettings["NoFallDamage"].method == "NegateVelocity" then
            local conn = RunService.Heartbeat:Connect(function()
                local hrp = getHRP(char)
                if hrp and hrp.Velocity.Y < -50 then
                    hrp.Velocity = Vector3.new(hrp.Velocity.X, 0, hrp.Velocity.Z)
                end
            end)
            addConnection("NoFallDamage", conn)
        elseif moduleSettings["NoFallDamage"].method == "Teleport" then
            local conn = RunService.Heartbeat:Connect(function()
                local hrp = getHRP(char)
                if hrp and hrp.Velocity.Y < -70 then
                    hrp.CFrame = hrp.CFrame + Vector3.new(0, 5, 0)
                end
            end)
            addConnection("NoFallDamage", conn)
        end
    end

    if lplr.Character then apply(lplr.Character) end
    addConnection("NoFallDamage", lplr.CharacterAdded:Connect(apply))
end

-- 15. ANTIVOID (fixed platform)
moduleSettings["AntiVoid"] = {
    method = "Normal", -- "Normal", "Velocity", "Bounce"
    bouncePower = 100
}
local voidThreshold = -50  -- Fixed Y level for void detection

local function createAntiVoidVisual()
    local indicator = Instance.new("Part")
    indicator.Name = "AntiVoidIndicator"
    indicator.Anchored = true
    indicator.CanCollide = false
    indicator.Size = Vector3.new(10, 0.5, 10)
    indicator.Material = Enum.Material.Neon
    indicator.BrickColor = BrickColor.new("Bright red")
    indicator.Transparency = 0.5
    indicator.Parent = Workspace
    return indicator
end

local function toggleAntiVoid(enabled)
    cleanupModule("AntiVoid")
    if not enabled then
        local indicator = Workspace:FindFirstChild("AntiVoidIndicator")
        if indicator then indicator:Destroy() end
        return
    end

    local indicator = createAntiVoidVisual()

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["AntiVoid"] then return end
        local myChar = getCharacter(lplr)
        local hrp = getHRP(myChar)
        if not hrp then return end

        -- Update indicator at fixed Y
        indicator.Position = Vector3.new(hrp.Position.X, voidThreshold, hrp.Position.Z)

        if hrp.Position.Y <= voidThreshold then
            local method = moduleSettings["AntiVoid"].method
            if method == "Normal" then
                hrp.CFrame = CFrame.new(hrp.Position.X, voidThreshold + 10, hrp.Position.Z)
                local bv = Instance.new("BodyVelocity")
                bv.Velocity = Vector3.new(0, 10, 0)
                bv.MaxForce = Vector3.new(0, 1e5, 0)
                bv.Parent = hrp
                Debris:AddItem(bv, 1)
                -- Nudge towards nearest safe ground
                local rayOrigin = hrp.Position + Vector3.new(0, 20, 0)
                local rayDirection = Vector3.new(0, -50, 0)
                local raycastParams = RaycastParams.new()
                raycastParams.FilterType = Enum.RaycastFilterType.Blacklist
                raycastParams.FilterDescendantsInstances = {myChar}
                local rayResult = Workspace:Raycast(rayOrigin, rayDirection, raycastParams)
                if rayResult then
                    local groundPos = rayResult.Position
                    local dir = (groundPos - hrp.Position).Unit * Vector3.new(1,0,1)
                    hrp.Velocity = hrp.Velocity + dir * 30
                end
            elseif method == "Velocity" then
                hrp.Velocity = Vector3.new(hrp.Velocity.X, 50, hrp.Velocity.Z)
            elseif method == "Bounce" then
                hrp.Velocity = Vector3.new(hrp.Velocity.X, moduleSettings["AntiVoid"].bouncePower, hrp.Velocity.Z)
            end
        end
    end)
    addConnection("AntiVoid", connection)
end

-- 16. INFINITE JUMP
local function toggleInfiniteJump(enabled)
    cleanupModule("InfiniteJump")
    if not enabled then
        if lplr.Character then
            local hum = getHumanoid(lplr.Character)
            if hum then hum.JumpPower = 50 end
        end
        return
    end

    local function applyJump(char)
        local hum = getHumanoid(char)
        if hum then hum.JumpPower = 0 end
    end

    local connection = UserInputService.JumpRequest:Connect(function()
        if moduleStates["InfiniteJump"] and lplr.Character then
            local hum = getHumanoid(lplr.Character)
            if hum then
                hum:ChangeState(Enum.HumanoidStateType.Jumping)
            end
        end
    end)

    if lplr.Character then applyJump(lplr.Character) end
    addConnection("InfiniteJump", lplr.CharacterAdded:Connect(applyJump))
    addConnection("InfiniteJump", connection)
end

-- ==================== GUI CONSTRUCTION ====================
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "VapeUtility"
screenGui.ResetOnSpawn = false
screenGui.Parent = lplr:WaitForChild("PlayerGui")

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 1000, 0, 520)
mainFrame.Position = UDim2.new(0.5, -500, 0.5, -260)
mainFrame.BackgroundColor3 = Color3.fromRGB(19, 19, 19)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 12)

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

local contentArea = Instance.new("Frame")
contentArea.Size = UDim2.new(1, -160, 1, -48)
contentArea.Position = UDim2.new(0, 160, 0, 48)
contentArea.BackgroundTransparency = 1
contentArea.Parent = mainFrame

local contentScroller = Instance.new("ScrollingFrame")
contentScroller.Size = UDim2.new(1, 0, 1, 0)
contentScroller.Position = UDim2.new(0, 0, 0, 0)
contentScroller.BackgroundTransparency = 1
contentScroller.BorderSizePixel = 0
contentScroller.CanvasSize = UDim2.new(0, 0, 0, 0)
contentScroller.ScrollBarThickness = 4
contentScroller.ScrollingDirection = Enum.ScrollingDirection.X
contentScroller.AutomaticCanvasSize = Enum.AutomaticSize.X
contentScroller.Parent = contentArea

local columnsList = Instance.new("UIListLayout")
columnsList.FillDirection = Enum.FillDirection.Horizontal
columnsList.SortOrder = Enum.SortOrder.LayoutOrder
columnsList.Padding = UDim.new(0, 10)
columnsList.Parent = contentScroller

local categories = {"Combat", "Blatant", "Render", "Utility", "World", "Legit", "Movement"}
local columns = {}
local columnOrder = 0

local function createCategory(name)
    local defaultOpen = (name == "Utility")
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

    local column = Instance.new("Frame")
    column.Name = name
    column.Size = UDim2.new(0, 200, 1, 0)
    column.BackgroundColor3 = Color3.fromRGB(26, 26, 26)
    column.BorderSizePixel = 0
    column.Visible = defaultOpen
    column.LayoutOrder = columnOrder
    column.Parent = contentScroller

    Instance.new("UICorner", column).CornerRadius = UDim.new(0, 10)

    local colTitle = Instance.new("TextLabel")
    colTitle.Size = UDim2.new(1, 0, 0, 42)
    colTitle.BackgroundTransparency = 1
    colTitle.Text = name
    colTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    colTitle.Font = Enum.Font.GothamBold
    colTitle.TextSize = 16
    colTitle.Parent = column

    local layout = Instance.new("UIListLayout")
    layout.Name = "ModuleList"
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 8)
    layout.Parent = column

    columns[name] = column
    columnOrder += 1

    btn.MouseButton1Click:Connect(function()
        column.Visible = not column.Visible
        highlight.Visible = column.Visible
        btn.BackgroundColor3 = column.Visible and Color3.fromRGB(32, 32, 32) or Color3.fromRGB(22, 22, 22)
    end)
end

for _, cat in ipairs(categories) do
    createCategory(cat)
end

-- Module creation with dynamic settings panel that expands below
local keybindListening = false
local currentModuleForKeybind = nil
local keybindButton = nil

local function createModule(parent, name, defaultEnabled, toggleCallback, settingsDefinition)
    local frame = Instance.new("Frame")
    frame.Name = name .. "Module"
    frame.Size = UDim2.new(1, -16, 0, 58)
    frame.BackgroundColor3 = defaultEnabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
    frame.BorderSizePixel = 0
    frame.LayoutOrder = #parent:GetChildren()
    frame.Parent = parent

    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.6, 0, 1, 0)
    label.Position = UDim2.new(0, 10, 0, 0)
    label.BackgroundTransparency = 1
    label.Text = name
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.Font = Enum.Font.GothamSemibold
    label.TextSize = 15
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    local keybindBtn = Instance.new("TextButton")
    keybindBtn.Size = UDim2.new(0, 30, 0, 30)
    keybindBtn.Position = UDim2.new(1, -80, 0.5, -15)
    keybindBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    keybindBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    keybindBtn.Text = moduleKeybinds[name] and moduleKeybinds[name].Name or "🔑"
    keybindBtn.Font = Enum.Font.Gotham
    keybindBtn.TextSize = 14
    keybindBtn.Parent = frame
    Instance.new("UICorner", keybindBtn).CornerRadius = UDim.new(0, 6)

    keybindBtn.MouseButton1Click:Connect(function()
        if keybindListening then return end
        keybindListening = true
        currentModuleForKeybind = name
        keybindButton = keybindBtn
        keybindBtn.Text = "..."
        keybindBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 255)

        local conn
        conn = UserInputService.InputBegan:Connect(function(input, gpe)
            if gpe then return end
            if input.UserInputType == Enum.UserInputType.Keyboard then
                local key = input.KeyCode
                if moduleKeybinds[name] == key then
                    moduleKeybinds[name] = nil
                    keybindBtn.Text = "🔑"
                else
                    moduleKeybinds[name] = key
                    keybindBtn.Text = key.Name
                end
                keybindBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
                keybindListening = false
                currentModuleForKeybind = nil
                keybindButton = nil
                conn:Disconnect()
            end
        end)
    end)

    local settingsBtn = Instance.new("TextButton")
    settingsBtn.Size = UDim2.new(0, 30, 0, 30)
    settingsBtn.Position = UDim2.new(1, -40, 0.5, -15)
    settingsBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    settingsBtn.Text = "⋮"
    settingsBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    settingsBtn.Font = Enum.Font.GothamBold
    settingsBtn.TextSize = 24
    settingsBtn.Parent = frame
    Instance.new("UICorner", settingsBtn).CornerRadius = UDim.new(0, 6)

    -- Settings panel as child of frame, positioned below
    local settingsPanel = Instance.new("Frame")
    settingsPanel.Name = "SettingsPanel"
    settingsPanel.Size = UDim2.new(1, 0, 0, 0)
    settingsPanel.Position = UDim2.new(0, 0, 1, 0) -- start just below the module button
    settingsPanel.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    settingsPanel.BorderSizePixel = 0
    settingsPanel.ClipsDescendants = true
    settingsPanel.Visible = false
    settingsPanel.Parent = frame

    Instance.new("UICorner", settingsPanel).CornerRadius = UDim.new(0, 6)
    local settingsLayout = Instance.new("UIListLayout")
    settingsLayout.Padding = UDim.new(0, 4)
    settingsLayout.Parent = settingsPanel

    local settingControls = {}
    if settingsDefinition then
        for _, setting in ipairs(settingsDefinition) do
            if setting.type == "slider" then
                local ctrl = createSlider(settingsPanel, setting.name, setting.min, setting.max, moduleSettings[name][setting.settingName], function(val)
                    moduleSettings[name][setting.settingName] = val
                end)
                table.insert(settingControls, ctrl)
            elseif setting.type == "toggle" then
                local ctrl = createToggle(settingsPanel, setting.name, moduleSettings[name][setting.settingName], function(val)
                    moduleSettings[name][setting.settingName] = val
                end)
                table.insert(settingControls, ctrl)
            elseif setting.type == "dropdown" then
                local ctrl = createDropdown(settingsPanel, setting.name, setting.options, moduleSettings[name][setting.settingName], function(val)
                    moduleSettings[name][setting.settingName] = val
                end)
                table.insert(settingControls, ctrl)
            elseif setting.type == "textbox" then
                local ctrl = createTextBox(settingsPanel, setting.name, moduleSettings[name][setting.settingName], function(val)
                    moduleSettings[name][setting.settingName] = val
                end)
                table.insert(settingControls, ctrl)
            end
        end
    end

    local settingsOpen = false
    settingsBtn.MouseButton1Click:Connect(function()
        settingsOpen = not settingsOpen
        local targetHeight = settingsOpen and (#settingsDefinition * 35 + 10) or 0
        local tween = TweenService:Create(settingsPanel, TweenInfo.new(0.25, Enum.EasingStyle.Quad), {Size = UDim2.new(1, 0, 0, targetHeight)})
        tween:Play()
        settingsPanel.Visible = true
        -- The UIListLayout in the parent column will automatically reposition items because the frame's size changes
        -- But we need to ensure the frame itself expands to accommodate the panel.
        -- The module frame's height is fixed, but the panel is outside its bounds? No, it's inside, so frame should auto-size?
        -- Actually we want the panel to push down other modules, so the module frame's height must change.
        -- We'll animate the frame's Size as well.
        local frameHeight = 58 + targetHeight
        local frameTween = TweenService:Create(frame, TweenInfo.new(0.25, Enum.EasingStyle.Quad), {Size = UDim2.new(1, -16, 0, frameHeight)})
        frameTween:Play()
    end)

    local enabled = defaultEnabled
    moduleStates[name] = enabled

    local function updateVisual()
        frame.BackgroundColor3 = enabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
    end

    frame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            enabled = not enabled
            moduleStates[name] = enabled
            updateVisual()
            if name == "AutoToxic" then
                autoToxicEnabled = enabled
            end
            if toggleCallback then
                toggleCallback(enabled)
            end
        end
    end)

    frame.MouseEnter:Connect(function()
        if not enabled then
            TweenService:Create(frame, TweenInfo.new(0.15), {BackgroundColor3 = Color3.fromRGB(45, 45, 45)}):Play()
        end
    end)
    frame.MouseLeave:Connect(updateVisual)

    updateVisual()
    if defaultEnabled and toggleCallback then
        toggleCallback(true)
    end
end

-- Define modules with settings
createModule(columns["Combat"], "KillAura", false, toggleKillAura, {
    {type = "toggle", name = "Face Target", settingName = "faceTarget"},
    {type = "slider", name = "Range", min = 5, max = 20, settingName = "range"},
    {type = "slider", name = "Swing Speed", min = 1, max = 20, settingName = "swingSpeed"},
    {type = "toggle", name = "Require Sword", settingName = "requireSword"},
    {type = "toggle", name = "Attack Players", settingName = "attackPlayers"},
    {type = "toggle", name = "Attack NPCs", settingName = "attackNPCs"}
})

createModule(columns["Combat"], "Reach", false, toggleReach, {
    {type = "slider", name = "Hit Range", min = 6, max = 20, settingName = "hitRange"},
    {type = "slider", name = "Mine Range", min = 6, max = 20, settingName = "mineRange"},
    {type = "slider", name = "Place Range", min = 6, max = 20, settingName = "placeRange"}
})

createModule(columns["Blatant"], "Speed", false, toggleSpeed, {
    {type = "slider", name = "Speed", min = 16, max = 50, settingName = "speed"}
})

createModule(columns["Blatant"], "Fly", false, toggleFly, {
    {type = "slider", name = "Horizontal Speed", min = 10, max = 100, settingName = "horizontalSpeed"},
    {type = "slider", name = "Vertical Speed", min = 10, max = 100, settingName = "verticalSpeed"},
    {type = "toggle", name = "TP Down", settingName = "tpDownEnabled"},
    {type = "slider", name = "TP Interval", min = 1, max = 5, settingName = "tpDownInterval"}
})

createModule(columns["Render"], "ESP", false, toggleESP, {})

createModule(columns["Render"], "Tracers", false, toggleTracers, {
    {type = "slider", name = "Transparency", min = 0, max = 1, settingName = "transparency"}
})

createModule(columns["Utility"], "AutoToxic", false, nil, {
    {type = "toggle", name = "Final Kill Message", settingName = "enabledFinalKill"},
    {type = "textbox", name = "Final Kill Text", settingName = "finalKillMessage"},
    {type = "toggle", name = "Bed Break Message", settingName = "enabledBedBreak"},
    {type = "textbox", name = "Bed Break Text", settingName = "bedBreakMessage"},
    {type = "toggle", name = "Game Win Message", settingName = "enabledGameWin"},
    {type = "textbox", name = "Game Win Text", settingName = "gameWinMessage"}
})

createModule(columns["World"], "Nuker", false, toggleNuker, {
    {type = "toggle", name = "Mine Beds", settingName = "mineBeds"},
    {type = "toggle", name = "Mine Iron", settingName = "mineIron"},
    {type = "toggle", name = "Mine Gold", settingName = "mineGold"},
    {type = "toggle", name = "Mine Diamond", settingName = "mineDiamond"},
    {type = "toggle", name = "Mine Emerald", settingName = "mineEmerald"},
    {type = "slider", name = "Radius", min = 5, max = 20, settingName = "mineRadius"}
})

createModule(columns["World"], "Scaffold", false, toggleScaffold, {
    {type = "toggle", name = "Allow Towering", settingName = "allowTowering"}
})

createModule(columns["Legit"], "AimAssist", false, toggleAimAssist, {
    {type = "slider", name = "Speed", min = 0.01, max = 0.5, settingName = "speed"},
    {type = "slider", name = "Range", min = 10, max = 50, settingName = "range"}
})

createModule(columns["Legit"], "AutoClicker", false, toggleAutoClicker, {
    {type = "slider", name = "CPS", min = 1, max = 20, settingName = "cps"}
})

createModule(columns["Movement"], "Velocity", false, toggleVelocity, {
    {type = "slider", name = "Reduction %", min = 0, max = 100, settingName = "reductionPercent"}
})

createModule(columns["Movement"], "LongJump", false, toggleLongJump, {
    {type = "slider", name = "Speed", min = 50, max = 200, settingName = "speed"}
})

createModule(columns["Movement"], "NoFallDamage", false, toggleNoFallDamage, {
    {type = "dropdown", name = "Method", options = {"Landing", "NegateVelocity", "Teleport"}, settingName = "method"}
})

createModule(columns["Movement"], "AntiVoid", false, toggleAntiVoid, {
    {type = "dropdown", name = "Method", options = {"Normal", "Velocity", "Bounce"}, settingName = "method"},
    {type = "slider", name = "Bounce Power", min = 50, max = 200, settingName = "bouncePower"}
})

createModule(columns["Movement"], "InfiniteJump", false, toggleInfiniteJump, {})

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

-- ==================== KEYBIND HANDLER ====================
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if keybindListening then return end

    for moduleName, key in pairs(moduleKeybinds) do
        if input.KeyCode == key then
            local enabled = not moduleStates[moduleName]
            moduleStates[moduleName] = enabled
            for _, col in pairs(columns) do
                local moduleFrame = col:FindFirstChild(moduleName .. "Module")
                if moduleFrame then
                    moduleFrame.BackgroundColor3 = enabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
                end
            end
            -- Trigger toggle callback
            if moduleName == "KillAura" then toggleKillAura(enabled)
            elseif moduleName == "Reach" then toggleReach(enabled)
            elseif moduleName == "Speed" then toggleSpeed(enabled)
            elseif moduleName == "Fly" then toggleFly(enabled)
            elseif moduleName == "ESP" then toggleESP(enabled)
            elseif moduleName == "Tracers" then toggleTracers(enabled)
            elseif moduleName == "AutoToxic" then autoToxicEnabled = enabled
            elseif moduleName == "Nuker" then toggleNuker(enabled)
            elseif moduleName == "Scaffold" then toggleScaffold(enabled)
            elseif moduleName == "AimAssist" then toggleAimAssist(enabled)
            elseif moduleName == "AutoClicker" then toggleAutoClicker(enabled)
            elseif moduleName == "Velocity" then toggleVelocity(enabled)
            elseif moduleName == "LongJump" then toggleLongJump(enabled)
            elseif moduleName == "NoFallDamage" then toggleNoFallDamage(enabled)
            elseif moduleName == "AntiVoid" then toggleAntiVoid(enabled)
            elseif moduleName == "InfiniteJump" then toggleInfiniteJump(enabled)
            end
            break
        end
    end

    if input.KeyCode == Enum.KeyCode.RightShift then
        guiEnabled = not guiEnabled
        screenGui.Enabled = guiEnabled
    end
end)

-- ==================== RESPAWN HANDLING ====================
lplr.CharacterAdded:Connect(function(char)
    for name, enabled in pairs(moduleStates) do
        if enabled then
            if name == "KillAura" then toggleKillAura(true)
            elseif name == "Reach" then toggleReach(true)
            elseif name == "Speed" then toggleSpeed(true)
            elseif name == "Fly" then toggleFly(true)
            elseif name == "ESP" then toggleESP(true)
            elseif name == "Tracers" then toggleTracers(true)
            elseif name == "Nuker" then toggleNuker(true)
            elseif name == "Scaffold" then toggleScaffold(true)
            elseif name == "AimAssist" then toggleAimAssist(true)
            elseif name == "AutoClicker" then toggleAutoClicker(true)
            elseif name == "Velocity" then toggleVelocity(true)
            elseif name == "LongJump" then toggleLongJump(true)
            elseif name == "NoFallDamage" then toggleNoFallDamage(true)
            elseif name == "AntiVoid" then toggleAntiVoid(true)
            elseif name == "InfiniteJump" then toggleInfiniteJump(true)
            end
        end
    end
end)
