﻿using Database.BackendEnums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Database.Tables;
public class GroupClient
{
    [Key]
    public uint GroupClientId { get; set; }

    [Required]
    public uint ClientId { get; set; }
    [ForeignKey("ClientId")]
    public virtual Client Client { get; set; }

    [Required]
    public uint GroupId { get; set; }
    [ForeignKey("GroupId")]
    public virtual Group Group { get; set; }

    [Required]
    public GroupClientPermission Permission { get; set; } 
}