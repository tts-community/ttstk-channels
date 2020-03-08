--LUA get all objects sample.--

function get_all_objects()
    local all = getAllObjects(
    for index, value in ipairs(all) do 
        local obj = {}
        obj['guid'] = value.guid
        obj['type'] = "object"
        obj['value'] = value.getJSON()
        sendExternalMessage(obj);
    end
end