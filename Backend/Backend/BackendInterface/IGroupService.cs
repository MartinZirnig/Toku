using BackendEnums;
using BackendInterface.Models;

namespace BackendInterface;
public interface IGroupService : IDisposable
{
    Task<RequestResultModel> CreateGroupAsync(GroupCreationModel model);
    Task<RequestResultModel> AddUserToGroupAsync(GroupAddUserModel model);
    Task<IEnumerable<GroupClientPermission>> GetUsersPermissions(Guid userId, uint groupId);
    Task<IEnumerable<AvailableGroupsModel>> GetAvailableGroupsAsync(Guid userId);
    Task<RequestResultModel> UpdateLastGroupAsync(UserGroupModel model);
    Task<RequestResultModel> ReadGroupAsync(UserGroupModel model);
}
