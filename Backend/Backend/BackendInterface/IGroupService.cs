using BackendEnums;
using BackendInterface.DataObjects;
using BackendInterface.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace BackendInterface;
public interface IGroupService : IDisposable
{
    Task<RequestResultModel> CreateGroupAsync(GroupCreationModel model);
    Task<RequestResultModel> AddUserToGroupAsync(GroupAddUserModel model);
    Task<IEnumerable<GroupClientPermission>> GetUsersPermissionsAsync(Guid userId, uint groupId);
    Task<IEnumerable<AvailableGroupsModel>> GetAvailableGroupsAsync(Guid userId);
    Task<GroupDataModel?> GetGroupAsync(Guid userId, uint id);
    Task<RequestResultModel> UpdateLastGroupAsync(UserGroupModel model);
    Task<RequestResultModel> ReadGroupAsync(UserGroupModel model);
    Task<RequestResultModel> RemoveUserFromGroupAsync(GroupRemoveUserModel model);
    Task<RequestResultModel> UpdatePermissionAsync(GroupUserAccessModel model, Guid executor);
    Task<RequestResultModel> UpdateGroupAsync(GroupUpdateModel model, Guid executor);
    Task<IEnumerable<GroupUserAccessModel>> GetGroupMembersAsync(Guid executor, uint groupId);
    Task<IEnumerable<LoggedUserData>> GetActiveGroupUsersAsync(uint groupId);
    Task<RequestResultModel> GetGroupLogAsync(uint groupId);

    Task<RequestResultModel> SetGroupPictureAsync(uint groupId, uint fileId);
    Task<RequestResultModel> GetGroupPicture(uint groupId);
    Task<RequestResultModel> JoinGroupAsync(GroupJoinModel model, Guid executor);
    Task<IEnumerable<PublicGroupInfoModel>> GetPublicGroupsAsync(Guid executor);
    Task<IEnumerable<GroupClientPermission>> GetUserPermissionsAsync(Guid executor, uint group);
    Task<IEnumerable<LoggedUserData>> GetCurrentGroupUsersAsync(uint groupId);
    Task<RequestResultModel> ReceiveMessagesAsync(Guid executor);
    Task<IEnumerable<Guid>> GetConnectedCoGroupersAsync(Guid executor);
    Task<IEnumerable<Guid>> GetConnectedUsersInGroup(uint groupId);
    Task<RequestResultModel> MuteAsync(MuteModel model, Guid executor);

}
