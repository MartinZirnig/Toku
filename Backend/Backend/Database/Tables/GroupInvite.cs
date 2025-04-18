﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BackendEnums;

namespace MysqlDatabase.Tables;
internal class GroupInvite
{
    [Key]
    public uint InviteId { get; set; }

    [Required]
    public uint UserId { get; set; }
    [ForeignKey("UserId")]
    public virtual User User { get; set; }

    [Required]
    public uint GroupId { get; set; }
    [ForeignKey("GroupId")]
    public virtual Group Group { get; set; }

    [Required]
    public InviteState InviteState { get; set; }
}
